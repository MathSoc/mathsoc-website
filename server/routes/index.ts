import express from "express";
import pages from '../config/pages.json';
import { PageLoader } from './page-loader';

const router = express.Router();

PageLoader.buildRoutes(pages, router);

export default router;