const db = require('../utils/database').db;

class Order {
    static all(callback) {
        db('orders')
            .select([
                'orderId',
                'orderState',
                'generateTime',
                'orders.userId as buyerId',
                'goods.userId as sellerId',
                'buyer.userName as buyerName',
                'seller.userName as sellerName',
                'orders.goodsId',
                'goodsName',
                'category',
                'picture',
                'price'
            ])
            .innerJoin('goods', 'orders.goodsId', 'goods.goodsId')
            .innerJoin('users as buyer', 'buyer.userId', 'buyerId')
            .innerJoin('users as seller', 'seller.userId', 'sellerId')
            .asCallback((error, orders) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                callback(orders, message);
            });
    }

    static delete(id, callback) {
        db('orders')
            .where('orderId', id)
            .del()
            .asCallback(error => {
                if (error) {
                    callback(error.message);
                } else {
                    callback('success');
                }
            });
    }

    static allAsSeller(sellerId, callback) {
        db('orders')
            .select([
                'orderId',
                'orderState',
                'generateTime',
                'orders.userId as buyerId',
                'goods.userId as sellerId',
                'buyer.userName as buyerName',
                'seller.userName as sellerName',
                'orders.goodsId',
                'goodsName',
                'category',
                'picture',
                'price'
            ])
            .innerJoin('goods', 'orders.goodsId', 'goods.goodsId')
            .innerJoin('users as buyer', 'buyer.userId', 'buyerId')
            .innerJoin('users as seller', 'seller.userId', 'sellerId')
            .where('sellerId', sellerId)
            .asCallback((error, orders) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                callback(orders, message);
            });
    }

    static getById(id, callback) {
        db('orders')
            .where('orderId', id)
            .asCallback((error, order) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                if (order.length === 0) {
                    callback(undefined, 'No such order: ' + id);
                } else {
                    callback(order[0], message);
                }
            });
    }

    static updateById(id, order, callback) {
        db('orders')
            .where('orderId', id)
            .update(order)
            .asCallback(error => {
                if (error) {
                    callback(error.message);
                } else {
                    callback('success');
                }
            });
    }

    static add(order, callback) {
        db('orders')
            .insert(order)
            .asCallback(error => {
                if (error) {
                    callback(error.message);
                } else {
                    db('goods')
                        .update('goodsState', '2')
                        .where('goodsId', order.goodsId)
                        .asCallback(error => {
                            if (error) {
                                console.error(error.message);
                            }
                        });
                    callback('success');
                }
            });
    }

    static belongToUser(userId, callback) {
        db('orders')
            .select([
                'orderId',
                'orderState',
                'generateTime',
                'orders.userId',
                'orders.goodsId',
                'goodsName',
                'category',
                'picture',
                'price'
            ])
            .innerJoin('goods', 'orders.goodsId', 'goods.goodsId')
            .where('orders.userId', userId)
            .asCallback((error, orders) => {
                let message = 'success';
                if (error) {
                    message = error.message;
                }
                callback(orders, message);
            });
    }

    static search(userId, keyword, orderState, asBuyer, callback) {
        let orderStates = [];
        if (orderState === undefined || orderState === -1) {
            orderStates = [0, 1, 2, 3];
        } else {
            orderStates.push(orderState);
        }
        db('orders')
            .select([
                'orderId',
                'orderState',
                'generateTime',
                'orders.userId as buyerId',
                'goods.userId as sellerId',
                'buyer.userName as buyerName',
                'seller.userName as sellerName',
                'orders.goodsId',
                'goodsName',
                'category',
                'picture',
                'price'
            ])
            .innerJoin('goods', 'orders.goodsId', 'goods.goodsId')
            .innerJoin('users as buyer', 'buyer.userId', 'buyerId')
            .innerJoin('users as seller', 'seller.userId', 'sellerId')
            .whereIn('orderState', orderStates)
            .andWhere(asBuyer ? 'orders.userId' : 'goods.userId', userId)
            .andWhere(builder => {
                builder
                    .whereRaw(
                        'LOWER(goods.goodsName) LIKE ?',
                        `%${keyword.toLowerCase()}%`
                    )
                    .orWhereRaw(
                        'LOWER(goods.description) LIKE ?',
                        `%${keyword.toLowerCase()}%`
                    )
                    .orWhereRaw(
                        'LOWER(orders.generateTime) LIKE ?',
                        `%${keyword.toLowerCase()}%`
                    )
                    .orWhereRaw(
                        'LOWER(goods.category) LIKE ?',
                        `%${keyword.toLowerCase()}%`
                    );
            })
            .asCallback((error, orders) => {
                let message = 'success';
                if (error) {
                    console.error(error);
                    message = error.message;
                }
                callback(orders, message);
            });
    }
}

module.exports.Order = Order;
