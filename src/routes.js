import express      from "express";
import multer       from "multer";
import multerConfig from "./config/multer.js";

import PPTController from "./controllers/PPTController.js";


const pptController = PPTController()
const router = express.Router();

router.post('/uploads/ppt/process', multer(multerConfig.multerConfigPPT).single('file'), (req, res) => {
    return res.json({ file: "uploaded" });
});

router.post('/uploads/ppt/preview', multer(multerConfig.multerConfigPPT).single('file'), pptController.createPreview);

router.post('/uploads/capa', multer(multerConfig.multerConfigCapa).single('file'), (req, res) => {
    return res.json({ file: "uploaded" });
});

router.post('/uploads/rodape', multer(multerConfig.multerConfigLogoCorretora).single('file'), (req, res) => {
    return res.json({ file: "uploaded" });
});

router.post('/uploads/contracapa', multer(multerConfig.multerConfigContracapa).single('file'), (req, res) => {
    return res.json({ file: "uploaded" });
});

router.get('/process', pptController.processPresentation);

router.post('/create_company', pptController.createPresentation);

router.get('/company/:company_id/suripoint', pptController.findPresentation);

router.get('/download', pptController.downloadPresentation);

router.get('/download/prepare_deploy', pptController.downloadAllImages);

router.get('/company/list', pptController.listCompanies);

router.get('/company/list_to_validate', pptController.listCompaniesToValidade);






export default router;