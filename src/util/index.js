function getImgFileDimension(file) {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    return new Promise((res) => {
        fileReader.onloadend = () => {
            res(fileReader.result)
        }
    }).then(getImgDimension)
}

function getImgDimension(src) {
    return new Promise((res) => {
        const img = new Image()
        img.src = src
        img.onload = () => {
            res({
                img
            })
        }
    })
}

/**
 * 
 * @param {Blob} blob
 * @param {string} path
 */
function downloadFile(blob, path) {
    const a = document.createElement('a')
    const url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
    const filename = path.replace(/^.*?([^/]+)$/, '$1')
    a.setAttribute('download', filename)
    a.click()
    URL.revokeObjectURL(url)
}

export {
    getImgFileDimension,
    downloadFile
}