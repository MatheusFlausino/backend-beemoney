# Kleb-in backend

- [x] Loopback

- [x] Monogodb

**Start Project**
--------------------
```javascript
$ node bin/autoupdate.js
$ node bin/populate.js
$ node .
```

**ACLs**
--------------------
Default **$authenticated**

- Usuario 

    - Create **$everyone**

	- resetPasswordAction **$unauthenticated**
	
- FAQ

    - READ **$everyone**
	
- Projeto

    - READ **$everyone**