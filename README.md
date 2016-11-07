## AeroGear Node.js Sync Server 

[![Build Status](https://api.travis-ci.org/aerogear/aerogear-nodejs-sync-server.svg?branch=master)](https://travis-ci.org/aerogear/aerogear-nodejs-sync-server)
[![Coverage Status](https://coveralls.io/repos/github/aerogear/aerogear-nodejs-sync-server/badge.svg?branch=master)](https://coveralls.io/github/aerogear/aerogear-nodejs-sync-server?branch=master)

This project in an implementation of Google's [Differential Synchonrization](http://research.google.com/pubs/pub35605.html) 
by Neil Fraser, that can be used by AeroGear's client libraries.

## Project Info

|                 | Project Info  |
| --------------- | ------------- |
| License:        | Apache License, Version 2.0  |
| Build:          | NPM  |
| Documentation:  | http://aerogear.org/sync/  |
| Issue tracker:  | https://issues.jboss.org/browse/AGSYNC  |
| Mailing lists:  | [aerogear-users](http://aerogear-users.1116366.n5.nabble.com/) ([subscribe](https://lists.jboss.org/mailman/listinfo/aerogear-users))  |
|                 | [aerogear-dev](http://aerogear-dev.1069024.n5.nabble.com/) ([subscribe](https://lists.jboss.org/mailman/listinfo/aerogear-dev))  |

## Building

### Installing Build Dependencies
To install the dependencies of the project run the following command:

    $ npm install

This will install the versions of the dependencies declared in package.json. This is only required to be done once before
building the first time, or if the dependencies in package.json have been updated.


### Starting the server

    $ npm start

## Documentation

For more details about the current release, please consult [our documentation](http://aerogear.org/sync).

### Resources
* [Differential Synchronization presentation](https://www.youtube.com/watch?v=S2Hp_1jqpY8)
* [Differential Synchronization paper](http://research.google.com/pubs/pub35605.html)
* [Differential Synchronization step by step keynote presentation](https://www.icloud.com/iw/#keynote/BAKHgqmqd5ETPe9ebKyBhSINoBo1QHaNPYeF/diffsync)

## Development

### Running tests

    $ npm test

To run a single test you can use:

    $ node test/sync-engine-test.js | node_modules/tap-spec/bin/cmd.js

### Running ESlint

    $ npm run lint

If you would like to help develop AeroGear you can join our [developer's mailing list](https://lists.jboss.org/mailman/listinfo/aerogear-dev), join #aerogear on Freenode, or shout at us on Twitter @aerogears.

Also takes some time and skim the [contributor guide](http://aerogear.org/docs/guides/Contributing/)

## Questions?

Join our [user mailing list](https://lists.jboss.org/mailman/listinfo/aerogear-users) for any questions or help! We really hope you enjoy app development with AeroGear!

## Found a bug?

If you found a bug please create a ticket for us on [Jira](https://issues.jboss.org/browse/AGSYNC) with some steps to reproduce it.

