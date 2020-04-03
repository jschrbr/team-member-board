"use strict";
const axios = require("axios");

const api = {
  async getUser(username) {
    try {
      const queryURL = `https://api.github.com/users/${username}`;
      const resp = await axios.get(queryURL);
      return resp.data;
    } catch (err) {
      return err.response.data.message;
    }
  }
};

module.exports = api;
