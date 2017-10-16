define([
    'jquery',
    'mage/translate',
    'underscore',
    'OwlCarousel'
], function ($, $t, _) {
    "use strict";

    /**
     * @private
     */
    var allowBase = true; //global var is needed because fotorama always fully reloads events in case of fullscreen

    /**
     * @private
     */
    function parseHref(href) {
        var a = document.createElement('a');

        a.href = href;

        return a;
    }

    /**
     * @private
     */
    function parseURL(href, forceVideo) {
        var id,
            type,
            ampersandPosition,
            vimeoRegex;

        /**
         * Get youtube ID
         * @param {String} srcid
         * @returns {{}}
         */
        function _getYoutubeId(srcid) {
            if (srcid) {
                ampersandPosition = srcid.indexOf('&');

                if (ampersandPosition === -1) {
                    return srcid;
                }

                srcid = srcid.substring(0, ampersandPosition);
            }

            return srcid;
        }

        if (typeof href !== 'string') {
            return href;
        }

        href = parseHref(href);

        if (href.host.match(/youtube\.com/) && href.search) {
            id = href.search.split('v=')[1];

            if (id) {
                id = _getYoutubeId(id);
                type = 'youtube';
            }
        } else if (href.host.match(/youtube\.com|youtu\.be/)) {
            id = href.pathname.replace(/^\/(embed\/|v\/)?/, '').replace(/\/.*/, '');
            type = 'youtube';
        } else if (href.host.match(/vimeo\.com/)) {
            type = 'vimeo';
            vimeoRegex = new RegExp(['https?:\\/\\/(?:www\\.|player\\.)?vimeo.com\\/(?:channels\\/(?:\\w+\\/)',
                '?|groups\\/([^\\/]*)\\/videos\\/|album\\/(\\d+)\\/video\\/|video\\/|)(\\d+)(?:$|\\/|\\?)'
            ].join(''));
            id = href.href.match(vimeoRegex)[3];
        }

        if ((!id || !type) && forceVideo) {
            id = href.href;
            type = 'custom';
        }

        return id ? {
            id: id, type: type, s: href.search.replace(/^\?/, '')
        } : false;
    }

    $.widget('unet.productVideo', {
        options: {
            videoImages: [],
            videoBlock: '#product-video',
            carouselConfig: {}
        },

        /**
         * Create
         * @private
         */
        _create: function () {
            this._initialize();
            this._loadVideoImages();
            this._loadVideoCarousel();
            this._loadVideoData();

            if (this._checkForVideoExist()) {
                this._checkForVimeo();
                this._isVideoBase();
            }
        },

        /**
         * Initialize
         * @private
         */
        _initialize: function () {
            this.options.carouselConfig = {
                items: 1,
                video:true,
                lazyLoad: true,
                loop: true,
                margin: 10,
                rewind: true,
                nav: true,
                dots: true,
                navText: [
                    $t("Prev"),
                    $t("Next")
                ]
            };
        },

        _loadVideoImages: function () {
            var self = this;
            var images = this.options.videoImages;

            images.forEach(function (image) {
                var imageElm = $('<img>', {class: 'owl-lazy'});
                imageElm.attr('data-src', image.full);
                imageElm.attr('alt', image.caption);
                $(self.options.videoBlock).append(imageElm);
            })
        },

        /**
         * Load carousel
         * @private
         */
        _loadVideoCarousel: function () {
            $(this.options.videoBlock).owlCarousel(this.options.carouselConfig);
        },

        _loadVideoData: function () {
            var $widget = this;

            if (!$widget.videoData) {
                $widget.videoData = $widget.options.VideoData;
            }
        },

        /**
         *
         * @returns {Boolean}
         * @private
         */
        _checkForVideoExist: function () {
            var key, result, checker, videoSettings;

            if (!this.options.videoData) {
                return false;
            }

            if (!this.options.videoSettings) {
                return false;
            }
            result = this._createVideoData(this.options.videoData, false), checker = false;
            videoSettings = this.options.videoSettings[0];
            videoSettings.playIfBase = parseInt(videoSettings.playIfBase, 10);
            videoSettings.showRelated = parseInt(videoSettings.showRelated, 10);
            videoSettings.videoAutoRestart = parseInt(videoSettings.videoAutoRestart, 10);

            for (key in result) {
                if (result[key].mediaType === this.VID) {
                    checker = true;
                }
            }

            if (checker) {
                this.options.videoData = result;
            }

            return checker;
        },

        /**
         *
         * @param {Object} inputData
         * @param {bool} isJSON
         * @returns {{}}
         * @private
         */
        _createVideoData: function (inputData, isJSON) {
            var videoData = [],
                dataUrl,
                tmpVideoData,
                tmpInputData,
                i;

            if (isJSON) {
                inputData = $.parseJSON(inputData);
            }

            for (i = 0; i < inputData.length; i++) {
                tmpInputData = inputData[i];
                dataUrl = '';
                tmpVideoData = {
                    mediaType: '',
                    isBase: '',
                    id: '',
                    provider: ''
                };
                tmpVideoData.mediaType = this.VID;

                if (tmpInputData.mediaType !== 'external-video') {
                    tmpVideoData.mediaType = tmpInputData.mediaType;
                }

                tmpVideoData.isBase = tmpInputData.isBase;

                if (tmpInputData.videoUrl != null) {
                    dataUrl = tmpInputData.videoUrl;
                    dataUrl = parseURL(dataUrl);
                    tmpVideoData.id = dataUrl.id;
                    tmpVideoData.provider = dataUrl.type;
                    tmpVideoData.videoUrl = tmpInputData.videoUrl;
                }

                videoData.push(tmpVideoData);
            }

            return videoData;
        },

        /**
         *
         * @private
         */
        _checkForVimeo: function () {
            var allVideoData = this.options.videoData,
                videoItem;

            for (videoItem in allVideoData) {
                if (allVideoData[videoItem].provider === this.VI) {
                    this._loadVimeoJSFramework();
                }
            }
        },

        /**
         *
         * @private
         */
        _isVideoBase: function () {
            var allVideoData = this.options.videoData,
                videoItem,
                allVideoDataKeys,
                key,
                i;

            allVideoDataKeys = Object.keys(allVideoData);

            for (i = 0; i < allVideoDataKeys.length; i++) {
                key = allVideoDataKeys[i];
                videoItem = allVideoData[key];

                if (
                    videoItem.mediaType === this.VID && videoItem.isBase &&
                    this.options.videoSettings[0].playIfBase && allowBase
                ) {
                    this.Base = true;
                    allowBase = false;
                }
            }
        },
    });

    return $.unet.productVideo;
});