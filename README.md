# slingshot-test

This is a simple example of using meteor-slingshot with a custom adapter
I.e. insteal of S3/Google/Rackspace  you want to make slingshot upload files to a server you control

The example has the slingshot code (app) and a sample server  written using express (fs) which will receive the fileup directly from the browser.

The two servers (meteor and express) could be on the same machine or completly different machines (the later being the purpose for why you would use slingshot instead of any other upload implementation)

This is just test code, so take it and use it for what it is.


