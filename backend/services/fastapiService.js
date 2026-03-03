const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const FASTAPI_URL = "http://127.0.0.1:8000";



exports.extractFile = async (file, gestation) => {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(file.path), {
    filename: file.originalname,
    contentType: file.mimetype
  });

  if (gestation) {
    formData.append("gestation", gestation);
  }

  let endpoint = "";

  // 🔥 Detect file type
  if (file.mimetype === "application/pdf") {
    endpoint = "http://127.0.0.1:8000/extract-pdf";
  } 
  else if (file.mimetype.startsWith("audio/")) {
    endpoint = "http://127.0.0.1:8000/extract-audio";
  } 
  else if (file.mimetype.startsWith("video/")) {
    endpoint = "http://127.0.0.1:8000/extract-video";
  } 
  else {
    throw new Error("Unsupported file type");
  }

  const response = await axios.post(
    endpoint,
    formData,
    {
      headers: {
        ...formData.getHeaders()
      }
    }
  );

  return response.data;
};
exports.extractText = async (text, gestation) => {
  const response = await axios.post(
    `${FASTAPI_URL}/extract-text`,
    { text, gestation }
  );

  return response.data;
};

exports.generateChecklist = async (gene) => {
  const response = await axios.post(
    `${FASTAPI_URL}/generate-checklist`,
    { gene }
  );

  return response.data;
};

exports.calculatePP4 = async (payload) => {
  const response = await axios.post(
    `${FASTAPI_URL}/calculate-pp4`,
    payload
  );

  return response.data;
};