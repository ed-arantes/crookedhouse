const ALGO = 'AES-GCM'

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function getKey(secretHex: string): Promise<CryptoKey> {
  const keyBytes = hexToBytes(secretHex)
  return crypto.subtle.importKey('raw', keyBytes, { name: ALGO }, false, [
    'encrypt',
    'decrypt',
  ])
}

export async function encrypt(plaintext: string, secretHex: string): Promise<string> {
  if (!plaintext) return ''
  const key = await getKey(secretHex)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded)
  // Format: base64(iv + ciphertext)
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return bytesToBase64(combined)
}

export async function decrypt(ciphertext: string, secretHex: string): Promise<string> {
  if (!ciphertext) return ''
  const key = await getKey(secretHex)
  const combined = base64ToBytes(ciphertext)
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, data)
  return new TextDecoder().decode(decrypted)
}
