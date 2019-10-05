const db = require('../utils/database').db;

class Goods {
    static all(callback) {
        db('goods')
            .select()
            .asCallback((error, goods) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                callback(goods, message);
            });
    }

    static getById(id, callback) {
        db('goods')
            .where('goodsId', id)
            .asCallback((error, goods) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                callback(goods, message);
            });
    }

    static updateById(id, goods, callback) {
        db('goods')
            .where('goodsId', id)
            .update(goods)
            .asCallback(error => {
                if (error) {
                    callback(error.message);
                } else {
                    callback('success');
                }
            });
    }

    static add(goods, callback) {
        db('goods')
            .insert(goods)
            .asCallback(error => {
                if (error) {
                    callback(error.message);
                } else {
                    callback('success');
                }
            });
    }

    static belongToUser(userId, callback) {
        db('goods')
            .select()
            .where('userId', userId)
            .asCallback((error, goods) => {
                if (error) {
                    throw error;
                } else {
                    callback(goods);
                }
            });
    }
}

module.exports.Goods = Goods;
