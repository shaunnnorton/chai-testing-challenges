require('dotenv').config()
const app = require('../server.js')
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const assert = chai.assert

const User = require('../models/user.js')
const Message = require('../models/message.js')

chai.config.includeStack = true

const expect = chai.expect
const should = chai.should()
chai.use(chaiHttp)

/**
 * root level hooks
 */
after((done) => {
    // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
    mongoose.models = {}
    mongoose.modelSchemas = {}
    mongoose.connection.close()
    done()
})

const SAMPLE_OBJECT_ID = 'RRRRRRRRRRRR'
const SAMPLE_USER_ID = "AAAAAAAAAAAA"

describe('Message API endpoints', () => {

    beforeEach((done) => {
        const sampleUser = new User({
            username:'me1',
            password:'password',
            _id:SAMPLE_USER_ID
        })
        sampleUser.save()
        const sampleMessage = new Message({
            title: "Hello World",
            body: "This is a test message",
            author: SAMPLE_USER_ID,
            _id: SAMPLE_OBJECT_ID
        })
        sampleMessage.save()
        done()
    })


afterEach((done) => {
    User.findByIdAndDelete(SAMPLE_USER_ID).then(()=>{
        
    })
    Message.deleteMany({ title: ['Hello World', 'Hello Mars', "SecondMessage"] }).then(() => {
        done()
    })
    
})

it('should load all messages', (done) => {
    chai.request(app)
        .get("/messages")
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            expect(res.body.messages).to.be.an("Array")
            done()
        })

})

it('should get one specific message', (done) => {
    chai.request(app)
        .get(`/messages/${SAMPLE_OBJECT_ID}`)
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            expect(res.body.message.title).to.be.a("String")
            expect(res.body.message.title).to.equal("Hello World")
            done()
        })
})

it('should post a new message', (done) => {
    chai.request(app)
        .post(`/messages`)
        .send({
            title: "SecondMessage",
            body: "Body of sample Message",
            author: SAMPLE_USER_ID
        })
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            Message.findOne({ title: "SecondMessage" }).then(message => {
                expect(message).to.be.an("Object")
                done()
            })
        })

})

it('should update a message', (done) => {
    chai.request(app)
        .put(`/messages/${SAMPLE_OBJECT_ID}`)
        .send({ title: "Hello Mars" })
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            expect(res.body.message).to.be.an("Object")
            expect(res.body.message).to.have.property("title", "Hello Mars")

            Message.findOne({ title: "Hello Mars" }).then((message) => {
                expect(message).to.be.an("Object")
                done()
            })

        })
})

it('should delete a message', (done) => {
    chai.request(app)
        .delete(`/messages/${SAMPLE_OBJECT_ID}`)
        .end((err, res) => {
            if (err) done(err)
            expect(res).to.have.status(200)
            expect(res.body.message).to.equal("Deleted Message")
            expect(res.body._id).to.equal(SAMPLE_OBJECT_ID)
            Message.findOne({ title: "Hello World" }).then(message => {
                expect(message).to.equal(null)
                done()
            })
        })
})
})

// const SAMPLE_OBJECT_ID = 'aaaaaaaaaaaa' // 12 byte string
// const SAMPLE_AUTHOR_ID = 'dddddddddddd'

// describe('Message API endpoints', () => {
//     // Create a sample user for use in tests.
//     beforeEach((done) => {
//         const sampleMessage = new Message({
//             title: 'mymessage',
//             body: 'message body',
//             _id: SAMPLE_OBJECT_ID,
//             author:SAMPLE_AUTHOR_ID
//         })
//         sampleMessage.save()
//         .then(() => {
//             done()
//         })
//     })

//     // Delete sample message.
//     afterEach((done) => {
//         Message.deleteMany({ title: ['mymessage', 'anothermessage'] })
//         .then(() => {
//             done()
//         })
//     })

//     it('should load all messages', (done) => {
//         chai.request(app)
//         .get('/messages')
//         .end((err, res) => {
//             if (err) { done(err) }
//             expect(res).to.have.status(200)
//             expect(res.body.messages).to.be.an("array")
//             done()
//         })
//     })

//     it('should get one message', (done) => {
//         chai.request(app)
//         .get(`/messages/${SAMPLE_OBJECT_ID}`)
//         .end((err, res) => {
//             if (err) { done(err) }
//             expect(res).to.have.status(200)
//             expect(res.body).to.be.an('object')
//             expect(res.body.result.title).to.equal('mymessage')
//             expect(res.body.result.body).to.equal("message body")
//             done()
//         })
//     })

//     it('should post a new message', (done) => {
//         chai.request(app)
//         .post('/messages')
//         .send({title: 'anothermessage', body: 'message body', author: SAMPLE_AUTHOR_ID})
//         .end((err, res) => {
//             if (err) { done(err) }
//             expect(res.body.message).to.be.an('object')
//             expect(res.body.message).to.have.property('title', 'anothermessage')

//             // check that user is actually inserted into database
//             Message.findOne({title: 'anothermessage'}).then(message => {
//                 expect(message).to.be.an('object')
//                 done()
//             })
//         })
//     })

//     it('should update a message', (done) => {
//         chai.request(app)
//         .put(`/messages/${SAMPLE_OBJECT_ID}`)
//         .send({title: 'anothermessage'})
//         .end((err, res) => {
//             if (err) { done(err) }
//             expect(res.body.message).to.be.an('object')
//             expect(res.body.message).to.have.property('title', 'anothermessage')

//             // check that user is actually inserted into database
//             Message.findOne({title: 'anothermessage'}).then(message => {
//                 expect(message).to.be.an('object')
//                 done()
//             })
//         })
//     })

//     it('should delete a message', (done) => {
//         chai.request(app)
//         .delete(`/messages/${SAMPLE_OBJECT_ID}`)
//         .end((err, res) => {
//             if (err) { done(err) }
//             expect(res.body.message).to.equal('Successfully deleted.')
//             expect(res.body._id).to.equal(SAMPLE_OBJECT_ID)

//             // check that user is actually deleted from database
//             Message.findOne({title: 'mymessage'}).then(message => {
//                 expect(message).to.equal(null)
//                 done()
//             })
//         })
//     })
// })
