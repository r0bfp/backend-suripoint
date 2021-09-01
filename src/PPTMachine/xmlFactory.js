import xml2js            from "xml2js";
import helpers           from "../helpers.js";

import fsPromisses       from "fs/promises";
import { fileURLToPath } from 'url';
import path              from "path";
import utf8              from "utf8";


const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function XML(xmlData){
    const parser  = new xml2js.Parser();
    const builder = new xml2js.Builder();
    const help    = helpers();

    const parsedContentTypes      = await parser.parseStringPromise(xmlData.contentTypes);
    const parsedPresentationFile  = await parser.parseStringPromise(xmlData.presentation);
    const parsedFirstSlideFile    = await parser.parseStringPromise(xmlData.firstSlide);


    // apaga o slide do arquivo [Content_Types].xml
    function removeFromContentTypes(slidesToRemove) {
        let cont = 0;

        parsedContentTypes.Types.Override.forEach((el, i) => {
            if(el['$'].PartName.includes('/slides/')) {
                cont += 1;
                if (slidesToRemove.includes(cont)){
                    delete parsedContentTypes.Types.Override[i];
                }
            }
        });

        return builder.buildObject(parsedContentTypes);
    }

    // apaga o slide do arquivo presentation.xml 
    function removeFromPresentationFile(slidesToRemove) {
        slidesToRemove.forEach(slideNumber => {
            delete parsedPresentationFile['p:presentation']['p:sldIdLst'][0]['p:sldId'][slideNumber - 1];
        });

        return builder.buildObject(parsedPresentationFile);
    }

    // localiza arquivos para fazer a remoção
    function findToRemoveFromSlides(slidesToRemove){
        let aux = {
            "slides": [],
            "slidesRel": []
        }

        const filesToRemove = []

        xmlData.slidesContentFolder.forEach((el) => {
            if(el.split('/').length > 1) aux.slidesRel.push(el)
            else aux.slides.push(el)
        });
        
        let cont = 0;
        help.sortWithNumbers(aux.slidesRel).forEach(e => {
            cont += 1;
            if(slidesToRemove.includes(cont)) filesToRemove.push(e);
        });
        
        cont = 0
        help.sortWithNumbers(aux.slides).forEach(e => {
            cont += 1;
            if(slidesToRemove.includes(cont)) filesToRemove.push(e);
        });
        
        return filesToRemove;
    }

    async function changeDescription(newDescription, brokerTemplate, secondDescription) {
        const relativeParsedXMLTemplate = await parser.parseStringPromise(await fsPromisses.readFile(path.resolve(__dirname, 'XMLtemplates', `${brokerTemplate}.xml`)));

        // newDescription = utf8.encode(newDescription);

        if(brokerTemplate.includes('sciath')){
            if(brokerTemplate.split('_')[1] == 'pt'){
                relativeParsedXMLTemplate['p:sp']['p:txBody'][0]['a:p'][2]['a:r'][0]['a:t'][0] = utf8.encode(newDescription);
            }else{
                relativeParsedXMLTemplate['p:sp']['p:txBody'][0]['a:p'][2]['a:r'][0]['a:t'][0] = utf8.encode(newDescription);
            }
        }else if (brokerTemplate.includes('emf')){
            relativeParsedXMLTemplate['p:sp']['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'][0] = utf8.encode(newDescription);
            relativeParsedXMLTemplate['p:sp']['p:txBody'][0]['a:p'][1]['a:r'][0]['a:t'][0] = utf8.encode(`(${secondDescription})`);
        }else{
            relativeParsedXMLTemplate['p:sp']['p:txBody'][0]['a:p'][0]['a:r'][0]['a:t'][0] = newDescription;
        }

        parsedFirstSlideFile['p:sld']['p:cSld'][0]['p:spTree'][0]['p:sp'] = relativeParsedXMLTemplate['p:sp'];

        return builder.buildObject(parsedFirstSlideFile);
    }


    return { 
        removeFromContentTypes, 
        removeFromPresentationFile,
        findToRemoveFromSlides,
        changeDescription
    }
}


export default XML;