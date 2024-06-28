import axios from "axios";

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,  //"https://localhost:8443/"
  headers: {
    "Content-type": "application/json"
  }
});
