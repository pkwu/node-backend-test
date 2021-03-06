require('babel-register');
require('babel-polyfill');

const { User } = require('../src/config/database/collections/userCollections');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/');
const should = chai.should();
const expect = chai.expect;
const deepEql = require('deep-eql');

chai.use(chaiHttp);

describe('Users', () => {
  beforeEach( done => {
    User.deleteMany({}, err => {
      done();
    });
  });

  /*
  * /GET
  */
  describe('/GET user', () => {
    it('should list ALL users on /users GET', done => {
      chai.request(server)
        .get('/api/users')
        .end( (err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          expect(res.body).to.be.an('array');
          res.body.length.should.equal(0);
          done();
        });
    });
    
    it('should list a SINGLE user on /users/:id GET', done => {
      const newUser = new User({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .get(`/api/users/${data.id}`)
          .end( (err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            const deepEval = {
              flag: deepEql(res.body, { 
                _id: data.id, 
                name: data.name, 
                dob: data.dob, 
                address: data.address, 
                description: data.description, 
                createdAt: JSON.stringify(data.createdAt).slice(1, -1), 
                updatedAt: JSON.stringify(data.updatedAt).slice(1, -1), 
                __v: data.__v })};
            deepEval.flag.should.equal(true);
            done();
          });
      });
    });

    it('should NOT fetch a non-existent user on /users/:id GET', done => {
      chai.request(server)
        .get('/api/users/1234567890')
        .end( (err, res) => {
          res.should.have.status(400);
          res.should.be.json;
          res.should.be.a('object');
          res.should.have.property('error');
          res.body.error.should.equal('Could not find User');
          done();
        });
    });
  });

  /*
  * /POST
  */
  describe('/POST user', () => {
    it('should add a user on /users POST when name, dob, address, description provided', done => {
      const user = {
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      };
      chai.request(server)
        .post('/api/users')
        .send(user)
        .end( (err, res) => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          const deepEval = {
            flag: deepEql(res.body, { 
              _id: res.body._id, 
              name: user.name, 
              dob: user.dob, 
              address: user.address, 
              description: user.description, 
              createdAt: res.body.createdAt, 
              updatedAt: res.body.updatedAt, 
              __v: res.body.__v })};
          deepEval.flag.should.equal(true);
          done();
        });
    });

    it('should add a user on /users POST while missing one or more fields', done => {
      const user = {
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles'
      };
      chai.request(server)
        .post('/api/users')
        .send(user)
        .end( (err, res) => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          const deepEval = {
            flag: deepEql(res.body, { 
              _id: res.body._id, 
              name: user.name, 
              dob: user.dob, 
              address: user.address, 
              createdAt: res.body.createdAt, 
              updatedAt: res.body.updatedAt, 
              __v: res.body.__v })};
          deepEval.flag.should.equal(true);
          done();
        });
    });
  });

  /*
  * /PUT
  */
  describe('/PUT user', () => {
    it('should update a user on /users/:id PUT with name, dob, address, description provided', done => {
      const updatedUser = {
        name: 'Updated User',
        dob: '01/01/2000',
        address: 'Hacienda Heights',
        description: 'This is an update'
      };
      const newUser = new User({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .put(`/api/users/${data.id}`)
          .send(updatedUser)
          .end( (err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('nModified');
            res.body.nModified.should.equal(1);
            done();
          });
      });
    });

    it('should NOT update any users on /users/ PUT without specified param', done => {
      const updatedUser = {
        name: 'Updated Name',
        description: 'This is an update'
      };
      const newUser = new User({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .put('/api/users/')
          .send(updatedUser)
          .end( (err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });
  });

  /*
  * /PATCH
  */
  describe('/PATCH user', () => {
    it('should patch a user on /users/:id PATCH with one or more fields missing', done => {
      const updatedUser = {
        name: 'Updated Name',
        description: 'This is an update'
      };
      const newUser = new User({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .patch(`/api/users/${data.id}`)
          .send(updatedUser)
          .end( (err, res) => {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('nModified');
            res.body.nModified.should.equal(1);
            done();
          });
      });
    });
  });

  /*
  * /DELETE
  */
  describe('/DELETE user', () => {
    it('should delete a user on /users/:id DELETE with id provided', done => {
      const newUser = new User({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .delete(`/api/users/${data.id}`)
          .end( (err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('n');
            res.body.n.should.equal(1);
            done();
          });
      });
    });

    it('should NOT delete a user on /users/:id DELETE with invalid id provided', done => {
      const newUser = new User ({
        name: 'Test User',
        dob: '08/27/2018',
        address: 'Los Angeles',
        description: 'This is a test'
      });
      newUser.save( (err, data) => {
        chai.request(server)
          .delete('/api/users/1234567890')
          .end( (err, res) => {
            res.should.have.status(400);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('error');
            res.body.error.should.equal('Could not delete User');
            done();
          });
      });
    });
  });
});