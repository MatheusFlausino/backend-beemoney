'use strict';

var g = require('strong-globalize')();

module.exports = function (Usuario) {
  Usuario.userLogout = userLogout;

  Usuario.validatesUniquenessOf('email');

  Usuario.remoteMethod('userLogout', {
    description: 'Logs user out.',
    accepts: [{
      arg: 'req',
      type: 'object',
      required: true,
      http: {
        source: 'body'
      }
    },
      // { arg: 'accessToken', type: 'object', http: function (ctx) { return ctx.req.accessToken; } }
    ],
    http: {
      verb: 'post',
      path: '/user-logout'
    }
  });


  Usuario.changePwd = changePwd;
  Usuario.remoteMethod('changePwd', {
    description: 'Changes a logged in user password.',
    accepts: [{
      arg: 'req',
      type: 'object',
      required: true,
      http: {
        source: 'body'
      }
    },
    {
      arg: 'accessToken',
      type: 'object',
      http: function (ctx) {
        if (!ctx.req.accessToken) {
          var createErr = new Error(g.f("Access Token is required"));
          createErr.statusCode = 401;
          createErr.name = 'NOT_AUTHORIZED';
          return createErr;
        } else {
          return ctx.req.accessToken;
        }
      }
    }
    ],
    http: {
      verb: 'post',
      path: '/change-pwd'
    }
  });

  function userLogout(req, fn) {
    console.log('LOGOUT!');
    if (!req.accessToken) {
      var err = new Error(g.f('Token required'));
      err.statusCode = 401;
      err.name = 'LOGOUT_FAILED';
      fn(err);
    } else {
      Usuario.logout(req.accessToken, function (err) {
        if (err) {
          console.log('Erro no logout');
          fn(err);
        } else {
          console.log('Sucesso no Logout');
          fn(null);
        }
      })
    }
  }

  function changePwd(req, accessToken, fn) {
    if (accessToken instanceof Error) {
      var err = accessToken;
      fn(err);
    }

    // Validations
    console.log(req);
    if (!(req.password_old && req.password_new && req.password_new_confirmation)) {
      var missingAttributes = new Error(g.f("Missing attributes: old password (oldPwd), new password (newPwd) and confirmation (confPwd)"));
      missingAttributes.statusCode = 422;
      fn(missingAttributes);
    }

    if (!req.password_new === req.password_new_confirmation) {
      var notMatchedPwd = new Error(g.f("New password and confirmation do not match"));
      notMatchedPwd.statusCode = 422;
      fn(notMatchedPwd);
    }
    // End validations
    console.log(accessToken);

    Usuario.findById(accessToken.userId, function (err, user) {
      if (err) {
        console.log('An error is reported from User.findById: %j', err);
        fn(err);
      }

      console.log(user);

      if (!user) {
        var createErr = new Error(g.f("User does not exist"));
        createErr.statusCode = 404;
        createErr.name = 'USER_NOT_FOUND';
        fn(createErr);
      }

      if (user) {
        // Verify if the old pwd is correct
        user.hasPassword(req.password_old, function (err, isMatch) {
          if (err) {
            fn(err);
          } else {
            // Verify if the new Pwd is different than the old one
            user.hasPassword(req.password_new, function (err, isMatch) {
              if (err) {
                console.log(err)
              }
              if (isMatch) {
                var samePwd = new Error(g.f("The new password needs to be different than the old one"));
                samePwd.statusCode = 422;
                samePwd.name = 'SAME_PWD';
                fn(samePwd);
              }
            })

            if (isMatch) {
              user.password = Usuario.hashPassword(req.password_new);
              user.save(function (err, user) {
                if (err) {
                  console.log(err);
                  var changePwdFailed = new Error(g.f("Could not change password"));
                  changePwdFailed.statusCode = 422;
                  fn(changePwdFailed);
                } else {
                  console.log('Senha alterada!');
                  fn(null);
                }
              })
            } else {
              var wrongPwd = new Error(g.f("The old password is wrong"));
              wrongPwd.statusCode = 422;
              wrongPwd.name = 'WRONG_OLD_PWD';
              fn(wrongPwd);
            }

          }
        })
      }
    })
  }

  function resetPasswordAction(data, fn) {
    // var accessToken = , password, confirmation
    // console.log(data);
    fn = fn || utils.createPromiseCallback();
    if (!data.accessToken) {
      var accErr = new Error(g.f("Missing AccessToken"));
      accErr.statusCode = 401;
      fn(accErr);
    }

    //verify passwords match
    if (!data.password ||
      !data.confirmation ||
      data.password !== data.confirmation) {
      // res.sendStatus(400, );
      var passErr = new Error('Passwords do not match');
      passErr.statusCode = 422;

      fn(passErr);
    }

    // console.log(data.accessToken);

    Usuario.findOne({
      where: {
        'resetPasswordToken': {
          like: '%' + data.accessToken + '%'
        }
      }
    }, function (err, user) {
      if (err) {
        var accErr = new Error(g.f("Invalid AccessToken"));
        accErr.statusCode = 401;
        fn(accErr);
      } else {
        if (user) {
          var passToken = JSON.parse(user.resetPasswordToken);

          var expiryDate = new Date(passToken.created).getTime() + passToken.ttl * 1000;

          console.log('NOW');
          console.log(new Date());
          console.log('Expiry date');
          console.log(new Date(expiryDate));

          if (Date.now() > expiryDate) {
            console.log('Token Expirado');
            var expiredToken = new Error(g.f("The token has expired"));
            expiredToken.statusCode = 401;
            fn(expiredToken);
          } else {
            user.password = Usuario.hashPassword(data.password);
            user.resetPasswordToken = null;
          }

          user.save(function (err) {
            if (err) {
              fn(err);
            } else {
              console.log('> password reset processed successfully');
              fn();
            }
          });
        }
      }
    });


    return fn.promise;
  }

  Usuario.resetPasswordAction = resetPasswordAction;
  Usuario.remoteMethod('resetPasswordAction', {
    description: 'Action to reset user password',
    accepts: [{
      arg: 'data',
      type: 'object',
      required: true,
      http: {
        source: 'body'
      }
    },],
    http: {
      verb: 'post',
      path: '/reset-password'
    }
  });

};
