FilePond.registerPlugin( // Register All plugins
    FilePondPluginImagePreview, // From Image preview
    FilePondPluginImageResize, // From Image resize
    FilePondPluginFileEncode, // From File encode
);

FilePond.setOptions({
    //stylePlaneLayout: circle,
    stylePanelAspectRatio: 150 /100, // from FilePond properties + Set a forced aspect ratio for the FilePond drop area
    imageResizeTargetWidth: 100, // from Image resize properties + Set the output width in pixels
    imageResizeTargetHeight: 150, // from Image resize properties + Set the output height in pixels
});

// FilePond from CDN + Turn all file input elements into ponds
FilePond.parse(document.body);