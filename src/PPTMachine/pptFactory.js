import JSZip      from "jszip";
import fs         from "fs";
import XML        from "./xmlFactory.js";
import path       from "path";
import helpers    from "../helpers.js";

async function PPT(presentation){
    const fsPromisses = fs.promises;
    const data        = await fsPromisses.readFile(presentation);
    const zip         = await JSZip.loadAsync(data);
    const help        = helpers();

    const xmlData = {
        contentTypes: await zip.files['[Content_Types].xml'].async('string'),
        presentation: await zip.files['ppt/presentation.xml'].async('string'),
        firstSlide: await zip.files['ppt/slides/slide1.xml'].async('string'),
        slidesContentFolder: zip.folder("ppt/slides/")
    }
    
    const xml = await XML(xmlData);


    async function deleteSlide(slidesToRemove){
        let contentTypes = await xml.removeFromContentTypes(slidesToRemove);
        let presentation = xml.removeFromPresentationFile(slidesToRemove);

        const filesToRemove = xml.findToRemoveFromSlides(slidesToRemove);

        filesToRemove.forEach(e => {
            zip.remove(`ppt/slides/${e}`);
        });

        zip.file('[Content_Types].xml', contentTypes);
        zip.file('ppt/presentation.xml', presentation);
    }

    
    async function findTotalSlideAmount() {
        let lastSlide = 0;

        zip.folder("ppt/media/").forEach(slide => {
            const slideNumber = parseInt(slide.split('.')[0].replace('image', ''));
            
            if(slideNumber > lastSlide) lastSlide = slideNumber;
        })
        
        return lastSlide;
    }

    async function changeFooterImage(imagePath) {
        const imageBuffer = await fsPromisses.readFile(imagePath);
        
        zip.folder("ppt/media").forEach((imageName) => {
            const imageNumber = parseInt(imageName.replace('image', '').split('.')[0]);
            const imageExtension = imageName.replace('image', '').split('.')[1]

            if(imageNumber > 3 && imageNumber < 150 && imageExtension == 'jpeg'){
                zip.file(`ppt/media/image${imageNumber}.${imageExtension}`, imageBuffer);
            }
        });
    }

    async function changeSlideImages(imagePath, imagePositionInPresentation){
        const imageBuffer = await fsPromisses.readFile(imagePath);

        let ext = ''
        zip.folder("ppt/media").forEach((imageName) => {
            let imageNumber = parseInt(imageName.split('.')[0].replace('image', ''), 10);

            if(imageNumber === imagePositionInPresentation){
                ext = imageName.split('.')[1];
            }
        });
        
        zip.file(`ppt/media/image${imagePositionInPresentation}.${ext}`, imageBuffer);
    }

    async function changeDescription(newDescription, brokerName, secondDescription, isEnglish) {
        let brokerTemplate = 'common';

        if(brokerName.toLowerCase().includes('pollo')){
            brokerTemplate = 'pollo';
        }

        if(brokerName.toLowerCase().includes('emf')){
            brokerTemplate = 'emf';
        }

        if(brokerName.toLowerCase().includes('sciath')){
            brokerTemplate = isEnglish ? 'sciath_en' : 'sciath_pt'
        }

        let firstSlide = await xml.changeDescription(newDescription, brokerTemplate, secondDescription);

        zip.file('ppt/slides/slide1.xml', firstSlide);
    }

    function renamePPT(filenameWithPath, filename) {
        fs.renameSync(filenameWithPath, filename);
        
        console.log(`[RENAMED] ${presentation}`);

        return true;
    }

    async function updatePPT(isEnglish, operatorName){
        const blob = await zip.generateAsync({ type:'nodebuffer' });
        fs.writeFileSync(presentation, blob);
        console.log(`[UPDATED] ${presentation}`);

        let filename = path.basename(presentation, '.pptx');
        filename = help.toTitleCase(filename.replace('anexo', '').trim());

        const today = {
            month: String(help.getCurrentDate().getMonth() + 1),
            year: String(help.getCurrentDate().getFullYear())
        }

        if(presentation.includes('anexo')){
            filename = `${today.month}.${today.year} - ${filename} - Análise de Gestão e Risco (Anexos).pptx`;
        }else{
            if(isEnglish){
                filename = `${today.month}.${today.year} - ${filename.split(' - ')[0]} - ${operatorName} - Loss Ratio Report.pptx`;
            }else{
                filename = `${today.month}.${today.year} - ${filename} - Análise de Gestão e Risco.pptx`;
            }
        }

        filename = path.resolve(path.dirname(presentation), 'ready_files', filename);

        renamePPT(presentation, filename);
    }


    return { 
        deleteSlide,
        updatePPT,
        changeSlideImages,
        changeDescription,
        findTotalSlideAmount,
        changeFooterImage
    }
}

export default PPT;
