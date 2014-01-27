"use strict";

var Page = require("./page")
  , CryptoJS = require("../core/cryptojs")
  , aes = require("../core/aes")
  , base64 = require("../core/base64")
  ;

var DecryptController = module.exports = function () {
  // Setup page
  this.page = new Page();

  this.page.submitCallback = this.submitDecrypt.bind(this);

  this.page.showDecryptForm();

};

DecryptController.prototype.submitDecrypt = function (password) {
  var b64ciphertext = this.page.getB64CipherText();
  aes.decrypt(b64ciphertext, password, this.decryptProgressCallback.bind(this));
};

DecryptController.prototype.decryptProgressCallback = function (error, percent, done, result) {
  if (error) {
    // for now, assume this means password was bad
    this.badPassword(0);
  } else if (done) {

    var binaryResult
      , decryptedObject
      , blob
      , blobUrl
      ;

    try {
      binaryResult = atob(result);
    } catch (err) {
      return this.badPassword(1);
    }

    try {
      decryptedObject = JSON.parse(binaryResult);
    } catch (err) {
      return this.badPassword(2);
    }

    try {
      blob = base64.b64ToBlob(decryptedObject.b64plaintext, decryptedObject.mimetype);
    } catch (err) {
      return this.badPassword(3);
    }

    blobUrl = URL.createObjectURL(blob);
    this.page.showFileLink(blobUrl);
    this.page.hideDecryptForm();

  } else {
    this.page.setProgressMeter(Math.floor(percent * 10000) / 100);
  }

};

DecryptController.prototype.badPassword = function (a) {
  /* jshint ignore:start */
  alert('WRONG PASSWORD' + a);
  /* jshint ignore:end */
};