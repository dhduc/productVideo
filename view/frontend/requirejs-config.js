/**
 * Copyright © 2016 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

var config = {
    "map": {
        "*": {
            "OwlCarousel": "Unet_ProductVideo/js/owl.carousel.min",
            "productVideo": "Unet_ProductVideo/js/product-video"
        }
    },
    "shim":{
        "Unet_ProductVideo/js/owl.carousel.min": ["jquery"],
        "Unet_ProductVideo/js/product-video": ["jquery", "OwlCarousel"]
    }
};