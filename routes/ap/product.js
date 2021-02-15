var express = require('express'),
    User    = require("../../models/ap/user"),
    Role    = require("../../models/ap/role"),
    Product = require("../../models/ap/product");
const { ensureAuth } = require('../../middleware/auth');
var router = express.Router();

// elastic search
const elasticsearch = require("elasticsearch");
const esClient = elasticsearch.Client({
  host: "http://127.0.0.1:9200",
});
esClient.ping(
    {
        requestTimeout: 30000
    },
    function(error) {
        if (error) {
            console.error("Cannot connect to Elasticsearch.");
            console.error(error);
        } else {
            console.log("Elasticsearch server is up!");
        }
    }
);
// ./elastic search

// #get form
router.get('/add', ensureAuth, (req, res) => {
    res.render('ap/products/add-product',{
        successFlash: req.flash('success'),
        errorFlash: req.flash('error'),
        title: "Home",
        baseUrl: req.baseUrl
    });
})
// #add form
router.post('/add', ensureAuth, (req, res) => {
    if(req.body) {
        let inputs = {
            title: req.body.title,
            description: req.body.description
        }
        Product.create(
            inputs
        ).then(function (record) {
            // if record is saved then save record for elastic search
            esClient.index({
                index: 'products',
                body: {
                    'id': record.id,
                    'title': record.title,
                    'description': record.description
                }
            })
            .then(response => {
                req.flash('success', "Indexing successful.");
                req.flash('success', "Record has been added.");
                res.redirect(req.baseUrl+'/list');
            })
            .catch(err => {
                 req.flash('error', "Error. "+err);
                 res.redirect(req.baseUrl+'/list')
            })
        }).catch(function (err) {
            req.flash('error', "Something went wrong. "+err);
            res.redirect(req.baseUrl+'/add')
        });
    }
})
// #list all
router.get('/list', ensureAuth, (req, res) => {
    Product.findAll({
        order: [
            ['id', 'DESC']
        ],  
    }).then((products) => {
        res.render('ap/products/list-product',{
            successFlash: req.flash('success'),
            errorFlash: req.flash('error'),
            title: "Home",
            products: products,
            baseUrl: req.baseUrl
        });
    })
})
// #get edit form
router.get('/edit/:id', ensureAuth, (req, res) => {
    Product.findOne({
        where: {id: req.params.id}
    }).then((product) => {
        res.render('ap/products/edit-product',{
            successFlash: req.flash('success'),
            errorFlash: req.flash('error'),
            title: "Update Product",
            product: product,
            baseUrl: req.baseUrl
        });
    })
})
// #udpate edit form
router.post('/update', ensureAuth, (req, res) => {
    let inputs = {
        id: req.body.productId,
        title: req.body.title,
        description: req.body.description
    };
    Product.update(
        inputs,
        {
            where: {
                id: req.body.productId
            }
        }
    ).then((product) => {
        // update elastic search entries
        updateEsRecord(inputs);

        req.flash('success', "Record has been updated.");
        res.redirect(req.baseUrl+'/list');
    }).catch(function (err) {
        req.flash('error', "Something went wrong. "+err);
        res.redirect(req.baseUrl+'/edit/'+req.params.id)
    });
})

// #update elastic search items
function updateEsRecord(data) {
    esClient.search({
        index: 'products',
        body: {
            query : {
                term: { "id" : data.id }
            }
        }
    }).then(found => {
        
        console.log('Found item: ', found.hits.hits[0]._id);

        if(found){
            esClient.update({
                index: 'products',
                id: found.hits.hits[0]._id,
                body: {
                    doc: {
                        id: data.id,
                        title: data.title,
                        description: data.description
                    }
                }
            })
            .then(response => {
                console.log('Updated successfully.');
            })
            .catch(err => {
                 console.log('Update error: ' +err);
            })
        }
    })
    .catch(err => {
        console.log('Not found Error: '+ err);
    });
}
// #delete record
router.get('/dlt/:id', (req, res) => {
    esClient.search({
        index: 'products',
        body: {
            query : {
                term: { "id" : req.params.id }
            }
        }
    }).then(found => {
        
        console.log('Found item: ', found.hits.hits[0]);

        esClient.delete({
            index: 'products',
            id: found.hits.hits[0]._id
        }).then(resp => {
            res.send({'success': 'deleted', msg: resp});
        }).catch(err => {
            res.send("Error: "+err);
        })
    })
    .catch(err => {
        res.send("Error: "+err);
    })
})
// #delete record both from local db and elasticsearch doc
router.get('/delete/:id', (req, res) => {
    Product.destroy({
        where: {
           id: req.params.id
        }
     }).then(function(rowDeleted){
       if(rowDeleted === 1){
        //  delete elastic element
        esClient.search({
            index: 'products',
            body: {
                query : {
                    term: { "id" : req.params.id }
                }
            }
        }).then(found => {    
            esClient.delete({
                index: 'products',
                id: found.hits.hits[0]._id
            }).then(resp => {
                req.flash('success', "Record has been deleted. Indexing deleted.");
                res.redirect(req.baseUrl+'/list');
            }).catch(err => {
                req.flash('error', ""+err);
                res.redirect(req.baseUrl+'/list');
            })
        })
        .catch(err => {
            req.flash('error', ""+err);
            res.redirect(req.baseUrl+'/list');
        })
        }
     }, function(err){
        req.flash('error', ""+err);
        res.redirect(req.baseUrl+'/list');
     });
})

// search record using elasic search
router.get('/search', (req, res) => {
    let query = {
        index: "products"
    };
    if(req.query.text){
        query.q = req.query.text;
    }
    esClient.search(query)
    .then(response => {
        return res.send(response);
    })
    .catch(err => {
        return res.status(500).json({"message": "Error "+err})
    })
})

// Reading data from table and insert into elastic search server
router.get('/es-data/insert', (req, res) => {
    Product.findAll({
        order: [
            ['id', 'DESC']
        ],  
    }).then((products) => {
        if(products.length > 0) {
            // code
        }
    });
})

module.exports = router;