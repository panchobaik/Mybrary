// This is going to be getting all the styles from the root element of our document
const rootStyles = window.getComputedStyle(document.documentElement);

if (rootStyles.getPropertyValue('--book-cover-width-large') != null && rootStyles.getPropertyValue('--book-cover-width-large') !== '') {
    ready();
} else {
    document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = coverWidth / coverAspectRatio;

    FilePond.registerPlugin( // Register All plugins
        FilePondPluginImagePreview, // From Image preview
        FilePondPluginImageResize, // From Image resize
        FilePondPluginFileEncode, // From File encode
    );
    
    FilePond.setOptions({
        //stylePlaneLayout: circle,
        stylePanelAspectRatio: 1/ coverAspectRatio, // from FilePond properties + Set a forced aspect ratio for the FilePond drop area
        imageResizeTargetWidth: coverWidth, // from Image resize properties + Set the output width in pixels
        imageResizeTargetHeight: coverHeight, // from Image resize properties + Set the output height in pixels
    });
    
    // FilePond from CDN + Turn all file input elements into ponds
    FilePond.parse(document.body);
}

