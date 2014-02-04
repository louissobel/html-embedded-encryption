"use strict";

var DecryptPage = require("./decrypt_page")
  , CryptoJS = require("../core/cryptojs")
  , aes = require("../core/aes")
  , blobs = require("../core/blobs")
  , passwordChecking = require("../core/password_checking")
  ;

var DecryptController = module.exports = function () {
  // Setup page
  this.page = (new DecryptPage()).init();

  this.page.submitCallback = this.submitDecrypt.bind(this);

  this.page.hideLoader();
  this.page.showDecryptForm();

};

DecryptController.prototype.submitDecrypt = function (password) {
  if (password === "") {
    return this.decryptError("You need to enter a password!");
  }

  this.page.disableForm();
  var b64ciphertext = this.page.getB64CipherText();

  // TODO CHECK LENGTH?
  this.page.showProgressBar();
  this.page.hideError();
  this.page.hideReady();

  aes.decrypt(b64ciphertext, password, this.decryptProgressCallback.bind(this));
};

DecryptController.prototype.decryptProgressCallback = function (error, percent, done, binaryResult, inProgress) {
  if (error) {
    // Assume this means bad password.
    this.badPassword();
  } else if (done) {

    if (!passwordChecking.checkString(binaryResult)) {
      return this.badPassword();
    }
    var jsonifiedObject = passwordChecking.unwrap(binaryResult)
      , decryptedObject = JSON.parse(jsonifiedObject)
      , blob = blobs.binaryStringToBlob(atob(decryptedObject.b64plaintext), decryptedObject.mimetype)
      , blobUrl = URL.createObjectURL(blob)
      ;

    this.page.showReady(blobUrl, decryptedObject);
    this.page.hideDecryptForm();
    this.page.hideProgressBar();

  } else {
    if (!passwordChecking.checkWordArray(inProgress)) {
      this.badPassword();
      return false;
    }
    this.page.setProgress(percent);
  }

};

DecryptController.prototype.badPassword = function () {
  this.decryptError("Incorrect Password!");
};

DecryptController.prototype.decryptError = function (message) {
  this.page.hideProgressBar();
  this.page.enableForm();
  this.page.showError(message);
};
