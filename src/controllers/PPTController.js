import zip               from "express-zip";
import fs                from "fs";
import { fileURLToPath } from 'url';
import path              from "path";

import SuriPoint         from "../model/SuriPoint.cjs";
import Company           from "../model/Company.cjs";
import Broker            from "../model/Broker.cjs";
import Operator          from "../model/Operator.cjs";
import createCore        from "../PPTMachine/core.js";

import helpers           from "../helpers.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

function PPTController() {
    const rootPath                   = path.resolve(__dirname, '..', '..');
    const pptProcessFolderPath       = path.resolve(rootPath, 'PPTs', 'process');
    const pptPublicImagesFolderPath  = path.resolve(rootPath, 'src', 'public', 'images');

    const help = helpers();

    const baseURL = 'https://backend-suripoint.herokuapp.com'
    // const baseURL = 'http://localhost:3000'

    async function createPreview(req, res, next) {
        const { dashboard_param } = req.body

        const companyData = await Company.findAll({
            where: { dashboard_param },
            include: [{
                model: SuriPoint
            },
            {
                model: Broker
            },
            {
                model: Operator
            }]
        });


        const preview = {
            principal: fs.readdirSync(path.resolve(pptPublicImagesFolderPath, 'principal')).map(e => {
                const number = parseInt(e.split('.')[0].replace('Slide', ''));
                const imgSrc = `${baseURL}/images/principal/${e}`;
                let selected = false;
                let normallyExcluded = false;
                const normallyExcludedSlidesNumber = [4, 5, 8, 9, 10, 11, 22, 23, 24, 37, 38, 39];

                if(companyData[0].SuriPoint){
                    const { dataValues } = companyData[0].SuriPoint;

                    const slideToRemovePrincipal = help.transformStringToArray(dataValues.slides_to_remove_principal);
        
                    slideToRemovePrincipal.includes(number) ? selected = true : selected;
                }
                
                normallyExcludedSlidesNumber.includes(number) ? normallyExcluded = true : normallyExcluded;

                return {
                    number,
                    imgSrc,
                    selected,
                    normallyExcluded
                }
            }),
            anexo: fs.readdirSync(path.resolve(pptPublicImagesFolderPath, 'anexo')).map(e => {
                const number = parseInt(e.split('.')[0].replace('Slide', ''));
                const imgSrc = `${baseURL}/images/anexo/${e}`;
                let selected = false;
                let normallyExcluded = false;
                const normallyExcludedSlidesNumber = [1, 2, 3];

                if(companyData[0].SuriPoint){
                    const { dataValues } = companyData[0].SuriPoint;

                    const slideToRemoveAnexo = help.transformStringToArray(dataValues.slides_to_remove_anexo);
        
                    slideToRemoveAnexo.includes(number) ? selected = true : selected;
                }

                normallyExcludedSlidesNumber.includes(number) ? normallyExcluded = true : normallyExcluded;
                
                return {
                    number,
                    imgSrc,
                    selected,
                    normallyExcluded
                }
            })
        }

        const parsedData = {
            data: {
                broker: companyData[0].Broker.nickname,
                operator: companyData[0].Operator.nickname
            },
            preview
        }

        if(companyData[0].SuriPoint){
            Object.assign(parsedData.data, companyData[0].SuriPoint.dataValues)
        }

        return res.json(parsedData);
    }

    async function createPresentation(req, res) {
        const { 
            dashboard_param,
            slides_to_remove_principal,
            slides_to_remove_anexo,
            description,
            has_footer_logo,
            has_covid_slide,
            has_last_slide
        } = req.body;

        const data = await Company.findAll({
            where: { dashboard_param },
            include: [{
                model: SuriPoint
            },{
                model: Broker
            }]
        });

        if(data[0].SuriPoint){
            await SuriPoint.update({
                slides_to_remove_principal,
                slides_to_remove_anexo,
                description,
                has_footer_logo,
                has_covid_slide,
                has_last_slide
            }, {
                where: { id: data[0].SuriPoint.id }
            });

            return res.send(`${dashboard_param} atualizada com sucesso!`);
        }else{
            await SuriPoint.create({
                companies_id: data[0].dataValues.id,
                broker_id: data[0].dataValues.id_health_brokerages,
                slides_to_remove_principal,
                slides_to_remove_anexo,
                description,
                has_footer_logo,
                has_covid_slide,
                has_last_slide
            });

            return res.send(`${dashboard_param} criada com sucesso!`);
        }
    }

    async function findPresentation(req, res) {
        const data = await Company.findAll({
            where: { dashboard_param: 'ebix' },
            include: [{
                model: SuriPoint
            },{
                model: Broker
            }]
        });

        return res.json(data);
    }

    async function processPresentation(req, res) {
        try {
            const core = await createCore();
            const coreStatus = await core.start();
    
            // console.log(coreStatus);
    
            return res.json(coreStatus);
        } catch (error) {
            return res.json(error)
        }
    }

    async function downloadPresentation(req, res) {
        const readyFilesPath = path.resolve(pptProcessFolderPath, 'ready_files');
        const files = fs.readdirSync(readyFilesPath);

        if(files.length > 1){
            const zipFile = files.map(e => {
                return {
                    path: path.resolve(readyFilesPath, e),
                    name: e
                }
            });

            return res.zip(zipFile, 'PPTs.zip');
        }

        return res.download(path.resolve(readyFilesPath, files[0]), files[0]);
    }

    async function downloadAllImages(req, res){
        const imagesFolder = fs.readdirSync(path.resolve(rootPath, 'images'));
        let zipFile = [];

        imagesFolder.forEach(folder => {
            fs.readdirSync(path.resolve(rootPath, 'images', folder)).forEach(file => {
                zipFile.push({
                    path: path.resolve(rootPath, 'images', folder, file),
                    name: `${folder}/${file}`
                });
            });
        });

        return res.zip(zipFile);
    }

    function cleanPresentationFolder(req, res, next){
        const pptFolderContent = fs.readdirSync(pptProcessFolderPath);
        
        pptFolderContent.forEach(file => {
            fs.unlinkSync(path.resolve(__dirname, '..', '..', 'PPTs', file));
        });
        
        if(req){
            next();
        }
    }

    async function listCompaniesToValidade(req, res, next){
        const data = await Company.findAll({
            raw: true,
            where: {
              status: 0
            },
            attributes: [
                'dashboard_param',
            ],
            include: [
                { model: SuriPoint, attributes: ['slides_to_remove_principal'] },
                { model: Broker, attributes: ['nickname'] },
                { model: Operator, attributes: ['nickname'] }
            ],
        });
        
        const coverPages = fs.readdirSync(path.resolve(rootPath, 'images', 'capa')).map(e => {
            return path.parse(e).name.toLocaleLowerCase();
        });

        let formattedData = data.map((e) => {
            if(e.dashboard_param){
                return {
                    companyName: e.dashboard_param,
                    brokerName: e['Broker.nickname'],
                    operatorName: e['Operator.nickname'],
                    hasCoverPage: coverPages.includes(e.dashboard_param.toLowerCase()) ? true : false,
                }
            }
        });

        formattedData = formattedData.filter((e) => e != null);

        return res.json(formattedData);
    }

    async function listCompanies(req, res){
        const data = await Company.findAll({
            raw: true,
            where: { status: 0 },
        });

        return res.json(data);
    }

    return{
        createPresentation,
        findPresentation,
        processPresentation,
        downloadPresentation,
        cleanPresentationFolder,
        createPreview,
        downloadAllImages,
        listCompaniesToValidade,
        listCompanies
    }
}

export default PPTController;