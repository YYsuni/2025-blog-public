export async function encrypt(text:string, key:string) {
  const enc = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 12字节IV
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(text)
  )

  // iv + 密文 一起转 base64 方便存储
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv, 0)
  result.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...result))
}

export async function decrypt(cipherText:string, key:string) {
  const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0))
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)

  const enc = new TextEncoder()
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    enc.encode(key)
  )

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  )

  return new TextDecoder().decode(decrypted)
}
