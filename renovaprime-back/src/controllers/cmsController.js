const cmsService = require('../services/cmsService');
const { successResponse, errorResponse } = require('../utils/response');

class CmsController {
  async findAllPublic(req, res, next) {
    try {
      const entries = await cmsService.findAll();
      const map = {};
      entries.forEach(e => { map[e.key] = e.content; });
      return res.json(successResponse(map));
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const entries = await cmsService.findAll();
      return res.json(successResponse(entries));
    } catch (error) {
      next(error);
    }
  }

  async findByKey(req, res, next) {
    try {
      const { key } = req.params;
      const entry = await cmsService.findByKey(key);
      return res.json(successResponse(entry));
    } catch (error) {
      if (error.message === 'CMS entry not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { key, title, content } = req.body;
      const entry = await cmsService.create({ key, title, content });
      return res.status(201).json(successResponse(entry));
    } catch (error) {
      if (error.message === 'CMS entry with this key already exists') {
        return res.status(409).json(errorResponse(error.message, 'DUPLICATE_KEY'));
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { key } = req.params;
      const { title, content } = req.body;
      const entry = await cmsService.update(key, { title, content });
      return res.json(successResponse(entry));
    } catch (error) {
      if (error.message === 'CMS entry not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }

  async upsert(req, res, next) {
    try {
      const { key } = req.params;
      const { title, content } = req.body;
      const { cms, created } = await cmsService.upsert(key, title, content);
      return res.status(created ? 201 : 200).json(successResponse(cms));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { key } = req.params;
      await cmsService.delete(key);
      return res.json(successResponse({ message: 'CMS entry deleted successfully' }));
    } catch (error) {
      if (error.message === 'CMS entry not found') {
        return res.status(404).json(errorResponse(error.message, 'NOT_FOUND'));
      }
      next(error);
    }
  }
}

module.exports = new CmsController();
