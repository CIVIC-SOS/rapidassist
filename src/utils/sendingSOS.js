import { supabase } from '../supabase';

const IMGBB_API_KEY = '7099a56971e1a7afff04ea2e1dd494a2';

/**
 * Captures 5 images at 1s intervals from the provided stream and uploads them in parallel.
 */
async function captureImages(stream, signal) {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.muted = true; // Prevent audio feedback during capture
  await video.play();

  const canvas = document.createElement('canvas');
  await new Promise(r => setTimeout(r, 100)); // Delay for dimensions
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const context = canvas.getContext('2d');

  const uploadPromises = [];

  for (let i = 0; i < 5; i++) {
    if (signal?.aborted) throw new Error('Aborted');

    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 1000);
      signal?.addEventListener('abort', () => {
        clearTimeout(t);
        reject(new Error('Aborted'));
      }, { once: true });
    });

    if (signal?.aborted) throw new Error('Aborted');

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturePromise = new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))
      .then(async (blob) => {
        if (signal?.aborted) return null;
        const formData = new FormData();
        formData.append('image', blob);
        try {
          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
            signal: signal
          });
          const data = await response.json();
          return data.success ? data.data.url : null;
        } catch (err) {
          if (err.name === 'AbortError') return null;
          console.error('imgBB upload error:', err);
          return null;
        }
      });

    uploadPromises.push(capturePromise);
    console.log(`Captured image ${i + 1}/5`);
  }

  const results = await Promise.all(uploadPromises);
  video.pause();
  return results.filter(url => url !== null);
}

/**
 * Records 7 seconds of audio and uploads to Supabase.
 */
async function recordAudio(stream, signal) {
  const audioOnlyStream = new MediaStream(stream.getAudioTracks());
  const mediaRecorder = new MediaRecorder(audioOnlyStream);
  const audioChunks = [];

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

    mediaRecorder.onstop = async () => {
      if (signal?.aborted) {
        resolve(null);
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const fileName = `sos_audio_${Date.now()}.webm`;

      if (!supabase) {
        console.warn('Supabase not configured. Using demo placeholder.');
        resolve(`https://demo-placeholder.com/audio/${fileName}`);
        return;
      }

      try {
        console.log(`Attempting upload: sos-recordings/audio/${fileName}`);
        const { data, error: uploadError } = await supabase.storage
          .from('sos-recordings')
          .upload(`audio/${fileName}`, audioBlob);

        if (uploadError) {
          console.warn('Subfolder upload failed, trying root...', uploadError.message);
          const { data: rootData, error: rootError } = await supabase.storage
            .from('sos-recordings')
            .upload(fileName, audioBlob);

          if (rootError) throw rootError;

          const { data: { publicUrl } } = supabase.storage
            .from('sos-recordings')
            .getPublicUrl(rootData.path);
          resolve(publicUrl);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('sos-recordings')
            .getPublicUrl(data.path);
          resolve(publicUrl);
        }
      } catch (error) {
        console.group('🆘 Supabase Storage Setup Required');
        console.error('Error:', error.message || error);
        console.warn('1. Go to Supabase > Storage');
        console.warn('2. Create a NEW bucket named: sos-recordings');
        console.warn('3. Set Bucket Privacy to PUBLIC');
        console.warn('4. Add a "Policy" to allow "Insert" for public/anon users');
        console.groupEnd();

        resolve(`https://demo-placeholder.com/audio/${fileName}`);
      }
    };

    if (signal) {
      signal.addEventListener('abort', () => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        reject(new Error('Aborted'));
      }, { once: true });
    }

    mediaRecorder.start();
    const timer = setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    }, 7000);

    if (signal) signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
  });
}

export async function sendSOS(signal) {
  console.log('🚀 SOS Triggered! Starting evidence capture...');
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 1280, height: 720 }
    });

    if (signal?.aborted) throw new Error('Aborted');

    const [audioUrl, imageUrls] = await Promise.all([
      recordAudio(stream, signal),
      captureImages(stream, signal)
    ]);

    const result = { audioUrl, imageUrls };
    console.log('✅ SOS Captured!', result);
    return result;
  } catch (error) {
    if (error.message === 'Aborted') console.log('SOS sequence aborted.');
    else console.error('❌ SOS Error:', error);
    throw error;
  } finally {
    if (stream) stream.getTracks().forEach(track => track.stop());
  }
}
