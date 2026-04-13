const Cms = require('../models/Cms');

class CmsService {
  async findAll() {
    return await Cms.findAll({
      order: [['key', 'ASC']]
    });
  }

  async findByKey(key) {
    const cms = await Cms.findByPk(key);
    if (!cms) {
      throw new Error('CMS entry not found');
    }
    return cms;
  }

  async create(data) {
    const existing = await Cms.findByPk(data.key);
    if (existing) {
      throw new Error('CMS entry with this key already exists');
    }

    return await Cms.create({
      key: data.key,
      title: data.title,
      content: data.content
    });
  }

  async update(key, data) {
    const cms = await Cms.findByPk(key);
    if (!cms) {
      throw new Error('CMS entry not found');
    }

    await cms.update({
      title: data.title,
      content: data.content
    });

    return cms;
  }

  async upsert(key, title, content) {
    const [cms, created] = await Cms.upsert({
      key,
      title,
      content
    }, {
      returning: true
    });

    return { cms, created };
  }

  async delete(key) {
    const cms = await Cms.findByPk(key);
    if (!cms) {
      throw new Error('CMS entry not found');
    }

    await cms.destroy();
    return true;
  }
}

module.exports = new CmsService();
