export type QRContentType = "url" | "sms" | "tel" | "mailto" | "wifi" | "text"

export interface ParsedQRContent {
  contentType: QRContentType
  data: {
    originalContent: string
    [key: string]: any // Allow for other properties based on type
  }
}

/**
 * Parses the raw QR code content to determine its type and extract relevant data.
 * @param rawContent The raw string decoded from the QR code.
 * @returns An object containing the content type and parsed data.
 */
export function parseQrContent(rawContent: string): ParsedQRContent {
  const trimmedContent = rawContent.trim()

  // 1. URL (http, https, ftp, file, custom schemes like app stores)
  if (
    /^https?:\/\//i.test(trimmedContent) ||
    /^ftp:\/\//i.test(trimmedContent) ||
    /^file:\/\//i.test(trimmedContent) ||
    /^(market|itms-apps|appstore):\/\//i.test(trimmedContent)
  ) {
    return {
      contentType: "url",
      data: { originalContent: trimmedContent, url: trimmedContent },
    }
  }

  // 2. SMS (sms:number?body=message)
  if (trimmedContent.startsWith("sms:")) {
    const parts = trimmedContent.substring(4).split("?")
    const number = parts[0]
    const body = parts.length > 1 ? new URLSearchParams(parts[1]).get("body") : undefined
    return {
      contentType: "sms",
      data: { originalContent: trimmedContent, number, body },
    }
  }

  // 3. SMS (SMSTO:number:message) - Common alternative format
  if (trimmedContent.startsWith("SMSTO:")) {
    const parts = trimmedContent.substring(6).split(":", 2) // Split by first colon only
    const number = parts[0]
    const body = parts[1] || undefined // Body might be empty
    return {
      contentType: "sms",
      data: { originalContent: trimmedContent, number, body },
    }
  }

  // 4. Telephone (tel:number)
  if (trimmedContent.startsWith("tel:")) {
    const number = trimmedContent.substring(4)
    return {
      contentType: "tel",
      data: { originalContent: trimmedContent, number },
    }
  }

  // 5. Email (mailto:email?subject=subject&body=body)
  if (trimmedContent.startsWith("mailto:")) {
    const mailtoContent = trimmedContent.substring(7) // Remove "mailto:"
    const questionMarkIndex = mailtoContent.indexOf("?")

    let email: string
    let subject: string | undefined
    let body: string | undefined

    if (questionMarkIndex !== -1) {
      email = mailtoContent.substring(0, questionMarkIndex)
      const queryString = mailtoContent.substring(questionMarkIndex + 1)
      const params = new URLSearchParams(queryString)
      subject = params.get("subject") || undefined
      body = params.get("body") || undefined
    } else {
      email = mailtoContent
    }

    return {
      contentType: "mailto",
      data: { originalContent: trimmedContent, email, subject, body },
    }
  }

  // 6. Email (MATMSG:TO:email;SUB:subject;BODY:body;;) - Common alternative format
  if (trimmedContent.startsWith("MATMSG:")) {
    const matmsgData: { [key: string]: string } = {}
    trimmedContent
      .substring(7) // Remove "MATMSG:"
      .split(";")
      .forEach((part) => {
        if (part.includes(":")) {
          const [key, value] = part.split(":", 2)
          matmsgData[key] = value
        }
      })
    return {
      contentType: "mailto",
      data: {
        originalContent: trimmedContent,
        email: matmsgData.TO,
        subject: matmsgData.SUB,
        body: matmsgData.BODY,
      },
    }
  }

  // 7. Wi-Fi (WIFI:S:<SSID>;T:<AUTH_TYPE>;P:<PASSWORD>;H:<HIDDEN>;;)
  if (trimmedContent.startsWith("WIFI:")) {
    const wifiData: { [key: string]: string } = {}
    trimmedContent
      .substring(5)
      .split(";")
      .forEach((part) => {
        if (part.includes(":")) {
          const [key, value] = part.split(":")
          wifiData[key] = value
        }
      })
    return {
      contentType: "wifi",
      data: {
        originalContent: trimmedContent,
        ssid: wifiData.S,
        authentication: wifiData.T,
        password: wifiData.P,
        hidden: wifiData.H === "true" || wifiData.H === "1",
      },
    }
  }

  // --- Inferred types (more robust checks - ordered after explicit schemes) ---

  // 8. Inferred Email (e.g., "user@example.com")
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedContent)) {
    return {
      contentType: "mailto",
      data: { originalContent: trimmedContent, email: trimmedContent },
    }
  }

  // 9. Inferred Phone Number (e.g., "123-456-7890", "+1 (123) 456-7890", "07123456789")
  // Allows for optional '+' at the start, digits, spaces, hyphens, and parentheses.
  // Checks for a minimum number of digits to avoid matching random numbers.
  const phoneNumberRegex = /^\+?[\d\s\-()]{7,20}$/
  const digitsOnly = trimmedContent.replace(/\D/g, "")
  if (phoneNumberRegex.test(trimmedContent) && digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return {
      contentType: "tel",
      data: { originalContent: trimmedContent, number: trimmedContent },
    }
  }

  // 10. Default to text if no other type matches
  return {
    contentType: "text",
    data: { originalContent: trimmedContent, text: trimmedContent },
  }
}
