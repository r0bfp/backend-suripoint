import fsPromisses       from "fs/promises";
import fs                from "fs";
import path              from "path";
import { fileURLToPath } from 'url';
import { Sequelize }     from "sequelize";
import levenshtein       from "fast-levenshtein";

import PPT               from "./pptFactory.js";
import helpers           from "../helpers.js";
import SuriPoint         from "../model/SuriPoint.cjs";
import Company           from "../model/Company.cjs";
import Broker            from "../model/Broker.cjs";
import Operator          from "../model/Operator.cjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const Op = Sequelize.Op


async function createCore(){
    let ppt = '';
    const help = helpers();
    const rootImagesPath = path.resolve(__dirname, '..', '..', 'images');
    const pptFolderPath = path.resolve(__dirname, '..', '..', 'PPTs', 'process');


    async function findCompanyData(companyName) {
        const data = await Company.findAll({
            where: { dashboard_param: companyName },
            include: [
                { model: SuriPoint },
                { model: Broker },
                { model: Operator }
            ]
        });

        return data;
    }

    async function findFooterImage(brokerName) {
        const logoCorretoraPath = path.resolve(rootImagesPath, 'logoCorretora');
        const brokerImagesFolderContent = await fsPromisses.readdir(logoCorretoraPath);

        let footerLogo = ''

        brokerImagesFolderContent.forEach(logo => {
            if(brokerName.toLowerCase().includes(logo.split('.')[0].toLowerCase())){
                footerLogo = path.resolve(logoCorretoraPath, logo);
            }
        });

        return footerLogo;
    }

    async function changeFooterLogo(brokerName) {
        brokerName = brokerName.toLowerCase();

        const imagePath = await findFooterImage(brokerName);

        if(!imagePath){
            return false
        }

        await ppt.changeFooterImage(imagePath);
        return true
    }

    async function findCoverPage(companyName){
        const rootPathCoverPage = path.resolve('images', 'capa');
        const coverPageFolderContent = await fsPromisses.readdir(rootPathCoverPage);

        let coverPage = ''
        
        coverPageFolderContent.forEach(logo => {
            if(companyName.toLowerCase().includes(path.basename(logo, path.extname(logo)).toLowerCase())){
                coverPage = path.resolve(rootPathCoverPage, logo);
            }
        });

        return coverPage
    }

    async function changeCoverPage(companyName){
        const imagePath = await findCoverPage(companyName);

        if(!imagePath){
            return false
        }

        await ppt.changeSlideImages(imagePath, 1);
        return true
    }

    async function removeSlides(slidesToRemove){
        slidesToRemove = help.transformStringToArray(slidesToRemove);
        await ppt.deleteSlide(slidesToRemove);
    }

    async function changeSumary(auditDate, english, brokerName) {
        if(english) {
            if(verifyAudit(auditDate, brokerName)){
                await ppt.changeSlideImages(path.resolve(rootImagesPath, 'sumario', 'modelo 3.jpeg'), 2);
            }else{
                await ppt.changeSlideImages(path.resolve(rootImagesPath, 'sumario', 'modelo 4.jpeg'), 2);
            }
        }else{
            if(verifyAudit(auditDate, brokerName)){
                await ppt.changeSlideImages(path.resolve(rootImagesPath, 'sumario', 'modelo 1.jpeg'), 2);
            }else{
                await ppt.changeSlideImages(path.resolve(rootImagesPath, 'sumario', 'modelo 2.jpeg'), 2);
            }
        }
    }

    async function findLastSlide(brokerName, isEnglish) {
        const rootPathLastSlide = path.resolve('images', 'ultimoSlide');
        const lastSlideFolderContent = await fsPromisses.readdir(rootPathLastSlide);

        let lastSlide = ''

        if(brokerName.toLowerCase().includes('sciath')){
            lastSlide = isEnglish ? path.resolve(rootPathLastSlide, 'sciath_en.png') : path.resolve(rootPathLastSlide, 'sciath_pt.png');
        }else{
            lastSlideFolderContent.forEach(image => {
                if(brokerName.toLowerCase().includes(image.split('.')[0].toLowerCase())){
                    lastSlide = path.resolve(rootPathLastSlide, image);
                }
            });
        }

        return lastSlide;
    }

    async function changeLastSlide(brokerName, isEnglish){
        const imagePath = await findLastSlide(brokerName, isEnglish);
        const lastSlideNumber = await ppt.findTotalSlideAmount();

        if(!imagePath){
            return false;
        }

        await ppt.changeSlideImages(imagePath, lastSlideNumber);

        return true;
    }

    function verifyAudit(auditDate, brokerName) {
        if(brokerName == 'Sciath') return false;

        const currentMonth = help.getCurrentDate().getMonth() + 1;
        const currentYear  = help.getCurrentDate().getFullYear();

        const today = `${String(currentYear)}-${String(('0' + currentMonth).slice(-2))}`;

        return auditDate === today ? true : false;
    }

    function changeDescription(data, companyName, isEnglish) {
        const operatorName = data[0].Operator.nickname;
        const brokerName   = data[0].Broker.nickname;

        const currentMonth = help.getCurrentDate().getFullMonth();
        const currentYear  = help.getCurrentDate().getFullYear();

        if('unimed jundiai'.includes(operatorName.toLowerCase())){
            operatorName = 'Unimed Jundiaí'
        }else if('sulamerica'.includes(operatorName.toLowerCase())){
            operatorName = 'SulAmérica'
        }

        let newDescription = ''
        let secondDescription = ''

        if(companyName.includes('anexo')){
            if(brokerName.toLowerCase().includes('emf')){
                newDescription = ` ${currentMonth}/${currentYear}`
                secondDescription = `Anexos`
            }else if(brokerName.toLowerCase().includes('sciath')) {
                const { initial, final } = calculatePeriod(data[0].dataValues, isEnglish);

                newDescription = `${initial} - ${final}`;
            }else{
                newDescription = `Relatório Mensal Anexos – ${currentMonth}/${currentYear} (${operatorName})`
            }
        }else{
            if(brokerName.toLowerCase().includes('emf')){
                newDescription = `${currentMonth}/${currentYear}`
                secondDescription = `Relatório Mensal`
            }else if(brokerName.toLowerCase().includes('sciath')) {
                const { initial, final } = calculatePeriod(data[0].dataValues, isEnglish);

                console.log(initial)
                console.log(final)

                newDescription = `${initial} - ${final}`;
            }else{
                newDescription = `Relatório Mensal – ${currentMonth}/${currentYear} (${operatorName})`
            }
        }

        ppt.changeDescription(newDescription, brokerName, secondDescription, isEnglish);
    }

    async function updatePPT(isEnglish, operatorName) {
        await ppt.updatePPT(isEnglish, operatorName);
    }

    function cleanReadyPPTFolder() {
        const readyPPTFolderContent = fs.readdirSync(path.resolve(pptFolderPath, 'ready_files'));

        readyPPTFolderContent.forEach(file => {
            fs.unlinkSync(path.resolve(pptFolderPath, 'ready_files', file));
        });
    }

    function cleanPPTFolder() {
        const PPTFolderContent = fs.readdirSync(pptFolderPath);

        PPTFolderContent.forEach(file => {
            const currentFilePath = path.resolve(pptFolderPath, file);

            if(!fs.lstatSync(currentFilePath).isDirectory()) fs.unlinkSync(currentFilePath);
        });
    }

    async function findClosestCompany(companyName){
        const data = await Company.findAll({
            raw: true
        });
        
        let closestCompany = '';
        let distance = 999;

        data.forEach((e) => {
            if(e.dashboard_param){
                const levDistance = levenshtein.get(companyName, e.dashboard_param);

                if (levDistance < distance){
                    distance = levDistance
                    closestCompany = e.dashboard_param
                }
            }
        });

        return closestCompany;
    }

    async function changeImagesForEnglish() {
        console.log('alterando slides em ingles');
        await ppt.changeSlideImages(path.resolve(rootImagesPath, 'ingles', 'auditoria.jpg'), 191);
        await ppt.changeSlideImages(path.resolve(rootImagesPath, 'ingles', 'sem_prevencao.jpg'), 203);
        await ppt.changeSlideImages(path.resolve(rootImagesPath, 'ingles', 'em_tratamento.jpg'), 243);
        await ppt.changeSlideImages(path.resolve(rootImagesPath, 'ingles', 'hiperconsultadores.jpg'), 287);
        await ppt.changeSlideImages(path.resolve(rootImagesPath, 'ingles', 'cronicos.jpg'), 304);
    }

    function calculatePeriod(data, isEnglish) {
        let initialComp     = help.convertDateToUTC(new Date()).toLocaleDateString().split('/').map((e) => parseInt(e));
        let finalComp       = help.convertDateToUTC(new Date()).toLocaleDateString().split('/').map((e) => parseInt(e));

        const delay         = data.Operator.competence_delay;
        const period        = data.report_period;
        const contractStart = data.contract_term.split('-').map((e) => parseInt(e));
        let startCount      = data.start_count.split('-').map((e) => parseInt(e));

        console.log('delay:        ', delay);
        console.log('period:       ', period);
        console.log('contractStart:', contractStart);
        console.log('startCount:   ', startCount);

        initialComp[1] = help.calculateMonth(initialComp[1], delay, 'sub').currentMonth
        initialComp[2] = initialComp[2] - help.calculateMonth(initialComp[1], delay, 'sub').yearsElapsedy
        
        finalComp[1] = help.calculateMonth(finalComp[1], delay, 'sub').currentMonth
        finalComp[2] = finalComp[2] - help.calculateMonth(finalComp[1], delay, 'sub').yearsElapsedy

        console.log('==========================')

        // console.log('initialComp:',initialComp);
        // console.log('finalComp:  ',finalComp);

        if(period.includes("12")){
            initialComp[1] = help.calculateMonth(initialComp[1], 11, 'sub').currentMonth
            initialComp[2] = initialComp[2] - help.calculateMonth(initialComp[1], 11, 'sub').yearsElapsedy

            const initialCompToCalculate   = `${initialComp[2].toString()}${initialComp[1].toString().padStart(2, '0')}`;
            const contractStartToCalculate = `${contractStart[2].toString()}${contractStart[1].toString().padStart(2, '0')}`;
            
            if(contractStartToCalculate > initialCompToCalculate){
                // console.log('1')
                // usar a data do inicio do contrato
                return {
                    'initial': `${help.convertNumericMonthsToExtense(contractStart[1], isEnglish)}/${contractStart[2]}`,
                    'final': `${help.convertNumericMonthsToExtense(finalComp[1], isEnglish)}/${finalComp[2]}`
                }
            }else{
                // console.log('2')
                // usar a data calculada
                return {
                    'initial': `${help.convertNumericMonthsToExtense(initialComp[1], isEnglish)}/${initialComp[2]}`,
                    'final': `${help.convertNumericMonthsToExtense(finalComp[1], isEnglish)}/${finalComp[2]}`
                }
            }
        }else{
            if(startCount[1] > initialComp[1]){
                // console.log('3')
                return {
                    'initial': `${help.convertNumericMonthsToExtense(startCount[1], isEnglish)}/${initialComp[2] - 1}`,
                    'final': `${help.convertNumericMonthsToExtense(finalComp[1], isEnglish)}/${finalComp[2]}`
                }
            }else{
                // console.log('4')
                return {
                    'initial': `${help.convertNumericMonthsToExtense(startCount[1], isEnglish)}/${initialComp[2]}`,
                    'final': `${help.convertNumericMonthsToExtense(finalComp[1], isEnglish)}/${finalComp[2]}`
                }
            }
        }
    }

    async function start() {
        try {
            cleanReadyPPTFolder();
            const pptsFolderContent = await fsPromisses.readdir(pptFolderPath);
            
            for (let filename of pptsFolderContent) {
                // obtendo o caminho completo para o ppt
                const filenameWithPath = path.resolve(pptFolderPath, filename);

                if(!fs.lstatSync(filenameWithPath).isDirectory()){
                    // instanciando a factory PPT
                    ppt = await PPT(filenameWithPath);

                    // retorna um objeto contendo os dados do nome do arquivo
                    const filenameParsed = path.parse(filenameWithPath);
                    
                    // obtendo somente o nome da empresa do arquivo que está sendo processado
                    let companyName = filenameParsed.name.toLowerCase();

                    // verificando se o relatorio esta em ingles
                    let isEnglish = false;
                    if(filenameParsed.name.split(' ').slice(-1)[0].toLowerCase().trim() == 'in'){
                        companyName = companyName.slice(0, companyName.length - 2).trim();
                        isEnglish = true
                    }

                    // obtendo os dados do ppt
                    const data = await findCompanyData(companyName.replace('anexo',''));

                    if(!data[0]){
                        cleanPPTFolder();

                        const closestCompany = await findClosestCompany(companyName);

                        return {
                            status: false,
                            statusMessage: 'Empresa não encontrada',
                            closestCompany,
                            companyName
                        }
                    }

                    const operatorName = data[0].Operator.dataValues.nickname;
                    const brokerName = data[0].Broker.dataValues.nickname;

                    if(!data[0].SuriPoint){
                        cleanPPTFolder();
                        return {
                            status: false,
                            statusMessage: 'Dados de exclusão não encontrados',
                            companyName
                        }
                    }

                    if(!companyName.includes('anexo')){
                        await changeSumary(data[0].audit_date, isEnglish, brokerName);
                    }

                    if(data[0].SuriPoint.has_footer_logo){
                        if(!await changeFooterLogo(data[0].Broker.nickname)){
                            cleanPPTFolder();
                            return {
                                status: false,
                                statusMessage: 'Logo da corretora não encontrado',
                                companyName
                            }
                        }
                    }
                    
                    if(data[0].SuriPoint.has_last_slide){
                        if(!await changeLastSlide(data[0].Broker.nickname, isEnglish)){
                            cleanPPTFolder();
                            return {
                                status: false,
                                statusMessage: 'Último slide não encontrado',
                                companyName
                            }
                        }
                    }

                    changeDescription(data, companyName, isEnglish);

                    if(companyName.includes('anexo')){
                        await removeSlides(data[0].SuriPoint.slides_to_remove_anexo);
                    }else{
                        if(verifyAudit(data[0].audit_date, brokerName)){
                            await removeSlides(data[0].SuriPoint.slides_to_remove_principal)
                        }else{
                            await removeSlides(data[0].SuriPoint.slides_to_remove_principal + ', 18, 19, 20')
                        }
                    }
                    
                    if(!await changeCoverPage(companyName.replace('anexo', ''))){
                        cleanPPTFolder();
                        return {
                            status: false,
                            statusMessage: 'Capa não encontrada',
                            companyName
                        }
                    }

                    await updatePPT(isEnglish, operatorName);
                }
            }

            return {
                status: true,
                statusMessage: 'Proccess successful' 
            }
        } catch (error) {
            console.log(error)
            return {
                status: false,
                statusMessage: error
            }
        }
    }

    return {
        start
    }
}

export default createCore;