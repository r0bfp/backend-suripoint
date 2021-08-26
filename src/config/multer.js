import multer            from "multer";
import path              from "path";
import { fileURLToPath } from 'url';
import fs                from "fs";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const multerConfig = {
    multerConfigPPT: {
        limits: { fileSize: Math.pow(1024, 3) },
        dest: path.resolve(__dirname, '..', '..', 'PPTs', 'process'),
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                let pptFolder = '';

                req.url === '/uploads/ppt/process' ? pptFolder = 'process' : pptFolder = 'createPreview'

                cb(null, path.resolve(__dirname, '..', '..', 'PPTs', pptFolder));
            },
            filename: (req, file, cb) => {
                const filename = file.originalname;
    
                cb(null, filename);
            }
        }),
        // fileFilter: (req, file, cb) => {
        //     const allowedMimes = [
        //         'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        //     ];
    
        //     if(allowedMimes.includes(file.mimetype)){
        //         cb(null, true);
        //     }else{
        //         cb(new Error('Invalid file Type'), true);
        //     }
        // }
    },    
    multerConfigCapa: {
        dest: path.resolve(__dirname, '..', '..', 'images', 'capa'),
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, '..', '..', 'images', 'capa'));
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'image/jpeg',
                'image/png'
            ];
    
            if(allowedMimes.includes(file.mimetype)){
                cb(null, true);
            }else{
                cb(new Error('Invalid file Type'), true);
            }
        }
    },
    multerConfigContracapa: {
        dest: path.resolve(__dirname, '..', '..', 'images', 'ultimoSlide'),
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, '..', '..', 'images', 'ultimoSlide'));
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'image/jpeg',
                'image/png'
            ];
    
            if(allowedMimes.includes(file.mimetype)){
                cb(null, true);
            }else{
                cb(new Error('Invalid file Type'), true);
            }
        }
    },
    multerConfigLogoCorretora: {
        dest: path.resolve(__dirname, '..', '..', 'images', 'logoCorretora'),
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, path.resolve(__dirname, '..', '..', 'images', 'logoCorretora'));
            },
            filename: (req, file, cb) => {
                cb(null, file.originalname);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'image/jpeg',
                'image/png'
            ];
    
            if(allowedMimes.includes(file.mimetype)){
                cb(null, true);
            }else{
                cb(new Error('Invalid file Type'), true);
            }
        }
    }
}


export default multerConfig;