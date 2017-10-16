<?php

namespace Unet\ProductVideo\Block\Product\View;

use Magento\Catalog\Api\ProductRepositoryInterface;

/**
 * Class Video
 * @package Unet\ProductVideo\Block\Product\Video
 */
class Video extends \Magento\Catalog\Block\Product\View
{
    /**
     * @var \Magento\Catalog\Block\Product\View\Gallery
     */
    private $gallery;

    /**
     * @var \Magento\ProductVideo\Block\Product\View\Gallery
     */
    private $videoGallery;

    public function __construct(
        \Magento\Catalog\Block\Product\Context $context,
        \Magento\Framework\Url\EncoderInterface $urlEncoder,
        \Magento\Framework\Json\EncoderInterface $jsonEncoder,
        \Magento\Framework\Stdlib\StringUtils $string,
        \Magento\Catalog\Helper\Product $productHelper,
        \Magento\Catalog\Model\ProductTypes\ConfigInterface $productTypeConfig,
        \Magento\Framework\Locale\FormatInterface $localeFormat,
        \Magento\Customer\Model\Session $customerSession,
        ProductRepositoryInterface $productRepository,
        \Magento\Framework\Pricing\PriceCurrencyInterface $priceCurrency,
        \Magento\Catalog\Block\Product\View\Gallery $gallery,
        \Magento\ProductVideo\Block\Product\View\Gallery $videoGallery,
        array $data = []
    ) {
        $this->videoGallery = $videoGallery;
        $this->gallery = $gallery;
        parent::__construct($context, $urlEncoder, $jsonEncoder, $string, $productHelper, $productTypeConfig,
            $localeFormat, $customerSession, $productRepository, $priceCurrency, $data);
    }

    /**
     * Retrieve video images
     * @return array
     */
    public function getVideoImages()
    {
        $imagesItems = [];

        foreach ($this->gallery->getGalleryImages() as $image) {
            if ($image->getMediaType() == \Magento\Catalog\Model\Product\Attribute\Backend\Media\ImageEntryConverter::MEDIA_TYPE_CODE) {
                continue;
            }
            $imagesItems[] = [
                'thumb' => $image->getData('small_image_url'),
                'img' => $image->getData('medium_image_url'),
                'full' => $image->getData('large_image_url'),
                'caption' => $image->getLabel(),
                'position' => $image->getPosition(),
                'isMain' => $this->isMainImage($image),
            ];
        }

        if (empty($imagesItems)) {
            $imagesItems[] = [
                'thumb' => $this->_imageHelper->getDefaultPlaceholderUrl('thumbnail'),
                'img' => $this->_imageHelper->getDefaultPlaceholderUrl('image'),
                'full' => $this->_imageHelper->getDefaultPlaceholderUrl('image'),
                'caption' => '',
                'position' => '0',
                'isMain' => true,
            ];
        }

        return json_encode($imagesItems);
    }

    /**
     * Retrieve video data in JSON format
     *
     * @return string
     */
    public function getMediaGalleryDataJson()
    {
        $mediaGalleryData = [];

        foreach ($this->getProduct()->getMediaGalleryImages() as $mediaGalleryImage) {
            if ($mediaGalleryImage->getMediaType() == \Magento\Catalog\Model\Product\Attribute\Backend\Media\ImageEntryConverter::MEDIA_TYPE_CODE) {
                continue;
            }

            $mediaGalleryData[] = [
                'mediaType' => $mediaGalleryImage->getMediaType(),
                'videoUrl' => $mediaGalleryImage->getVideoUrl(),
                'isBase' => $this->isMainImage($mediaGalleryImage),
            ];
        }

        return json_encode($mediaGalleryData);
    }

    /**
     * Is product main image
     *
     * @param \Magento\Framework\DataObject $image
     * @return bool
     */
    public function isMainImage($image)
    {
        $product = $this->getProduct();
        return $product->getImage() == $image->getFile();
    }

    /**
     * @return string
     */
    public function getVideoSettingsJson()
    {
        return $this->videoGallery->getVideoSettingsJson();
    }

    /**
     * @return string
     */
    public function getOptionsMediaGalleryDataJson()
    {
        return $this->videoGallery->getOptionsMediaGalleryDataJson();
    }

}