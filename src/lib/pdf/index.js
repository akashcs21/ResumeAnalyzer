// PDF parsing logic using pdf-parse

/**
 * Parse a PDF file buffer and extract text content
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @returns {Promise<{ text: string, numPages: number, info: object }>}
 */
export async function parsePDF(fileBuffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(fileBuffer);

  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info,
  };
}
