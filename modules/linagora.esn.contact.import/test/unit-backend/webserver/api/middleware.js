'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('The contact import middleware', function() {

  function checkResponseError(expected, done) {
    return {
      status: function(code) {
        expect(code).to.equal(expected);
        return {
          json: function() {
            done();
          }
        };
      }
    };
  }

  describe('The checkRequiredBody function', function() {

    var req, lib;

    beforeEach(function() {
      lib = {
        importers: {}
      };
      req = {
        params: {
          type: 'twitter'
        },
        token: {
          token: '123'
        },
        user: {
          _id: 1
        }
      };
    });

    var getMiddleware = function() {
      return require('../../../../backend/webserver/api/middleware')(function() {}, lib);
    };

    it('should send back HTTP 400 when req.body is undefined', function(done) {
      getMiddleware().checkRequiredBody(req, checkResponseError(400, done), function() {
        done(new Error());
      });
    });

    it('should send back HTTP 400 when req.body.account_id is undefined', function(done) {
      req.body = {};
      getMiddleware().checkRequiredBody(req, checkResponseError(400, done), function() {
        done(new Error());
      });
    });

    it('should call next when req.body.account_id is defined', function(done) {
      req.body = {account_id: 123456789};
      getMiddleware().checkRequiredBody(req, {
        status: function() {
          done(new Error());
        }
      }, function() {
        done();
      });
    });
  });

  describe('The getAccount function', function() {

    var req, lib;
    var accountId = 123;

    beforeEach(function() {
      lib = {
        importers: {}
      };
      req = {
        params: {
          type: 'twitter'
        },
        token: {
          token: '123'
        },
        body: {
          account_id: accountId
        },
        user: {
          _id: 1,
          accounts: []
        }
      };
    });

    var getMiddleware = function() {
      return require('../../../../backend/webserver/api/middleware')(function() {}, lib);
    };

    it('should send back HTTP 404 when account is not found', function(done) {
      getMiddleware().getAccount(req, checkResponseError(404, done), function() {
        done(new Error());
      });
    });

    it('should set the account in the request and call next', function(done) {
      var provider = 'twitter';
      var account = {
        data: {
          provider: provider,
          id: accountId
        }
      };
      req.params.type = provider;
      req.body = {
        account_id: accountId
      };
      req.user.accounts.push(account);
      getMiddleware().getAccount(req, null, function() {
        expect(req.account).to.deep.equal(account);
        done();
      });
    });
  });
});
