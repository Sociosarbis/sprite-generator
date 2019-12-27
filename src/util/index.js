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

export {
    getImgFileDimension
}