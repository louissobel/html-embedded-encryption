"use strict";

// Page View for encryption controller

var FileInputView = require("./file_input_view")
  , BasePage = require("../core/base_page")
  , blobDelivery = require("../core/blob_delivery")
  , inherits = require("../core/utils").inherits
  , SlideView = require("./slide_view")
  ;

var EncryptPage = module.exports = function () {};
inherits(EncryptPage, BasePage);

EncryptPage.prototype.init = function () {
  BasePage.prototype.init.call(this);

  this.fileInput = document.getElementById("file-select");
  this.fileBrowseButton = document.getElementById("file-select-button");
  this.fileBrowseDisplay = document.getElementById("file-select-display");

  this.fileInputView = new FileInputView(this.fileInput, this.fileBrowseButton, this.fileBrowseDisplay);

  this.doneLink = document.getElementById("done-link");

  this.slideView = new SlideView(document.getElementById("div-slide-wrapper"));
  this.learnMoreLink = document.getElementById("learn-more-link");
  this.leaveFaqLink = document.getElementById("leave-faq-link");
  this.learnMoreLink.onclick = this.handleLearnMore.bind(this);
  this.leaveFaqLink.onclick = this.handleLeaveFaq.bind(this);

  return this;
};

EncryptPage.prototype.showReady = function (options, callback) {
  blobDelivery.makeLink({
    link: this.doneLink
  , filename: options.filename + "__encrypted.html"
  , blob: options.blob
  , onready: function (err) {
      if (err) {
        return callback(err);
      }
      BasePage.prototype.showReady.call(this);
      return callback(null);
    }.bind(this)
  });

};

EncryptPage.prototype.handleFormSubmit = function () {
  if (this.submitCallback) {
    var password = this.passwordInput.value
      , selectedFile = this.fileInput.files[0] || null
      ;
    this.submitCallback(password, selectedFile);
    return false;
  }
};

EncryptPage.prototype.getDecryptTemplate = function () {
  return document.getElementById("decrypt-template").textContent;
};

EncryptPage.prototype.handleLearnMore = function () {
  this.slideView.rotateLeft();
  return false;
};

EncryptPage.prototype.handleLeaveFaq = function () {
  // If we are on /faq, after we are done rotating, go to /
  if (window.location.pathname.match(/faq$/)) {
    this.slideView.onrotate = function () {
      window.location = "/";
    };
  }
  this.slideView.rotateRight();
  return false;
};
