import db from '../../config/db.js'
import moment from 'moment';
import chalk from 'chalk';

export async function clientExist(clientId){

    const { rows: client} = await db.query(`
        SELECT * FROM clients
        WHERE clients.id = $1
    `, [clientId]);

    if(client.length == 0){
        return false
    }

    return true;
}

export async function cakeExist(cakeId){

    const { rows: cake} = await db.query(`
        SELECT * FROM cakes
        WHERE cakes.id = $1
    `, [cakeId]);

    if(cake.length == 0){
        return false
    }

    return true;
}

export async function insertOrder(order){
    const today = new Date();
    const {clientId, cakeId, quantity, totalPrice} = order

    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date+' '+time;
    
    await db.query(`
        INSERT INTO orders("clientId", "cakeId", quantity, "totalPrice")
        VALUES ($1,$2,$3,$4)
    `, [clientId, cakeId, quantity, totalPrice])

    return
}

export async function getOrdersList(){

    const ordersList = []

    async function buildObj(clientId, cakeId){
        const { rows: clientInfo } = await db.query(`
            SELECT id, name, address, phone
            FROM clients
            WHERE id = $1
            `, [clientId])
        const { rows: cakeInfo } = await db.query(`
            SELECT id, name, price, description, image
            FROM cakes
            WHERE id = $1
        `, [cakeId])

        return ( { client: clientInfo[0], cake: cakeInfo[0]} )
    }

    const { rows: orders}  = await db.query(`
        SELECT "clientId", "cakeId", id AS "orderId", "createdAt", quantity, "totalPrice" 
        FROM orders
    `, [])
    
    orders.map(async (order) => {
        console.log('eu to dentro daqui ? ')
        const clientAndCakeINFO = await buildObj(order.clientId, order.cakeId)

        const object  = {
            client: clientAndCakeINFO.client,
            cake: clientAndCakeINFO.cake,
            orderId: order.orderId,
            createdAt: moment(order.createdAt).format('YYYY-MM-DD HH:MM'),
            quantity: order.quantity,
            totalPrice: order.totalPrice
        }
        ordersList.push(object)
    })
    console.log('building ordersList... \n')

    console.log(ordersList)
    return ordersList
}