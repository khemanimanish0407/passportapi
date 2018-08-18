var convict = require('convict');
var fs = require('fs');

var config = convict({
	env: {
		doc: 'The applicaton environment.',
		format: ['test'],
		default: 'test',
		env: 'NODE_ENV',
		arg: 'env'
	},
	cluster: {
		workerCount: {
			doc: 'No of worker Thread',
			format: Number,
			default: 6
		}
	},
	server: {
		port: {
			doc: 'HTTP port to bind',
			format: 'port',
			default: 3004,
			env: 'PORT'
		},
		enableHttpLogging: {
			doc: 'Enable HTTP Logging',
			format: Boolean,
			default: true
		},
		enableCompression: {
			doc: 'Enable HTTP compression',
			format: Boolean,
			default: false
		},
		enableStatic: {
			doc: 'Enable Express static server',
			format: Boolean,
			default: false
		},
		enablePassportAuthentication: {
			doc: 'Enable Passport authentication',
			format: Boolean,
			default: false
		},
		enableSessionCouchbase: {
			doc: 'Enable Couchbase session storage',
			format: Boolean,
			default: false
		},
		enableCSRFSecurity: {
			doc: 'Enable CSRF security',
			format: Boolean,
			default: false
		},
		security: {
			enableXframe: {
				doc: 'Enable Iframe protection',
				format: Boolean,
				default: false
			},
			enableHidePoweredBy: {
				doc: 'Hide X powered by Header',
				format: Boolean,
				default: true
			},
			enableNoCaching: {
				doc: 'Enable No caching',
				format: Boolean,
				default: false
			},
			enableCSP: {
				doc: 'Enable CSP policy',
				format: Boolean,
				default: false
			},
			enableHSTS: {
				doc: 'Enable HSTS',
				format: Boolean,
				default: false
			},
			enableXssFilter: {
				doc: 'Enable XSS filter protection',
				format: Boolean,
				default: false
			},
			enableForceContentType: {
				doc: 'Enable force content type',
				format: Boolean,
				default: false
			},
			enableCORS: {
				doc: 'Enable CORS',
				format: Boolean,
				default: true
			}
		},
		CORS: {
			allowedHosts: {
				doc: 'Allowed Host for CORS',
				format: Array,
				default: []
			},
			allowedMethods: {
				doc: 'Allowed HTTP Methods for CORS',
				format: String,
				default: 'GET,POST,OPTIONS'
			},
			allowedHeaders: {
				doc: 'Allowed HTTP Headers for CORS',
				format: String,
				default: 'accept, x-xsrf-token,content-type, x-location, certificate'
			},
			exposedHeaders: {
				doc: 'Exposed HTTP Headers for CORS',
				format: String,
				default: 'XSRF-TOKEN'
			}
		},
		session: {
			sidname: {
				doc: 'Name of a session',
				format: String,
				default: 'connect.sid'
			},
			path: {
				doc: 'Path of a session',
				format: String,
				default: '/'
			},
			httpOnly: {
				doc: 'httpOnly cookie',
				format: Boolean,
				default: true
			},
			secure: { // should be set to true when using https
				doc: 'Http security of a session',
				format: Boolean,
				default: false
			},
			maxAge: {
				doc: 'Maximum age of a session',
				format: Number,
				default: 24 * 60 * 60 * 1000 // one day
			},
			proxy: { // should set to true when using https and reverse proxy
				// like HAproxy
				doc: 'Http proxy',
				format: Boolean,
				default: false
			},
			rolling: { // should set to true when want to have sliding window
				// session
				doc: 'For sliding window of a session',
				format: Boolean,
				default: false
			}
		},
		bodyParser: {
			limit: {
				doc: 'maximum request body size',
				format: String,
				default: '100kb'
			}
		}
	},
	logger: {
		httpLogFormat: {
			doc: 'HTTP log format',
			format: String,
			default: ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'
		},
		httpLogFileName: {
			doc: 'HTTP log File name',
			format: String,
			default: 'http.log'
		},
		logFileName: {
			doc: 'Log File name',
			format: String,
			default: 'logs.log'
		},
		exceptionLogFileName: {
			doc: 'Exception log File name',
			format: String,
			default: 'exceptions.log'
		},
		logFileSize: {
			doc: 'logs File Max File size',
			format: Number,
			default: 5242880
		},
		enableElasticSearchLogger: {
			doc: 'flag to check whther to enable elastic search logger',
			format: Boolean,
			default: false
		},
		elasticsearchLogIndexName: {
			doc: 'Log index name',
			format: String,
			default: 'hcuserapilog'
		},
		elasticsearchExceptionIndexName: {
			doc: 'Exception log index name',
			format: String,
			default: 'hcuserapiexception'
		}
	},
	couchbase: {
		host: {
			doc: 'Couchbase cluster nodes.',
			format: String,
			default: 'couchbase://127.0.0.1',
		},
		buckets: {
			session: {
				doc: 'Data bucket name',
				format: String,
				default: 'demo'
			},
			db: {
				doc: 'Data bucket name',
				format: String,
				default: 'demo'
			}
		},
		defaultBucket: {
			doc: 'This bucket will be used as the default bucket by couch-db',
			format: String,
			default: 'demo'
		}
	},
	apiUrls: {
		userApiUrl: {
			doc: 'User API url',
			format: String,
			default: 'http://localhost:3001/'
		},
		keyApiUrl: {
			doc: 'Keys API url',
			format: String,
			default: 'http://localhost:3002/'
		},
		measurementApiUrl: {
			doc: 'Measurement API url',
			format: String,
			default: 'http://localhost:3003/'
		},
		masterDataApiUrl: {
			doc: 'Master Data API url',
			format: String,
			default: 'http://localhost:3006/'
		},
		syncApiUrl: {
			doc: 'Synchronization API url',
			format: String,
			default: 'http://localhost:3005/'
		},
		mailApiUrl: {
			doc: 'Synchronization API url',
			format: String,
			default: "http://localhost:3006/"
		}
	},
	dutchSupportedPlateformVersions: {
		doc: 'dutch supported platform versions',
		format: String,
		default: 'IO1.5;IO1.5.1;IO1.6;PC3.5;AN1.4;AN1.5;AN1.6'
	},
	SwedishSupportedPlateformVersions: {
		doc: 'swedish supported platform versions',
		format: String,
		default: 'IO1.7;PC3.6;AN1.7'
	},
	version: {
		doc: 'Stores version number',
		format: String,
		default: '149'
	},
	sql: {
		host: {
			doc: 'Sql server address.',
			format: String,
			default: '192.168.0.227'
		},
		database: {
			BeurerCloudUser: {
				doc: 'Beurer Cloud User database name',
				format: String,
				default: 'HealthForYouCMS'
			},
			BeurerCloudMeasurements: {
				doc: 'Beurer Cloud measurement database name',
				format: String,
				default: 'HealthForYouCMS'
			},
			BeurerCloudMapSync: {
				doc: 'Beurer Cloud map sync database name',
				format: String,
				default: 'HealthForYouCMS'
			}
		},
		defaultDatabase: {
			doc: 'This database will be used as the default bucket by sql-db',
			format: String,
			default: 'HealthForYouCMS'
		},
		user: {
			doc: 'User name',
			format: String,
			default: 'sa'
		},
		password: {
			doc: 'Database server password',
			format: String,
			default: 'zb!8011/am'
		},
		isConnectionEncrypted: {
			doc: 'Flag for encrypted connection.',
			format: Boolean,
			default: true
		},
		connectionTimeout: {
			doc: 'Time for connection timeout',
			format: Number,
			default: 600000
		},
		requestTimeout: {
			doc: 'Time for request timeout',
			format: Number,
			default: 600000
		},
		connectionPool: {
			maximum: {
				doc: 'Maximum number of connections.',
				format: Number,
				default: 1
			},
			minimum: {
				doc: 'Minimum number of connections.',
				format: Number,
				default: 0
			},
			idleTimeoutMillis: {
				doc: 'Time for idle timeout',
				format: Number,
				default: 600000
			}
		}
	},
	ApplicationName: {
		BeurerCloud: {
			doc: 'Application name for beurer cloud',
			format: String,
			default: 'HealthCoachCMS'
		},
		BeurerUSCloud: {
			doc: 'Application name for BeurerUS Cloud',
			format: String,
			default: 'BeurerUSCloud'
		},
		SanitasCloud: {
			doc: 'Application name for Sanitas Cloud',
			format: String,
			default: 'SanitasCloud'
		}
	},
	imagePath: {
		ProductOverviewImageIPad: {
			doc: 'folder path for ipad',
			format: String,
			default: 'ProductOverviewImages/IPad/'
		},
		ProductOverviewImageIPhone: {
			doc: 'folder path for iphone',
			format: String,
			default: 'ProductOverviewImages/IPhone/'
		}
	},
	accessTokenTTL: {
		doc: 'Master Data API url',
		format: Number,
		default: 20 * 60 * 60
	},
	DeleteAccountLink: {
		doc: 'DeleteAccountLink',
		format: String,
		default: 'http://192.168.0.155/SanitasConnect/HealthCoach/Modules/Account/DeleteUserCompletion.aspx?deleteLink='
	},
	CancelLink: {
		doc: 'CancelLink',
		format: String,
		default: 'http://192.168.0.155/SanitasConnect/HealthCoach/Modules/Account/DeleteUserCompletion.aspx?cancelLink='
	},
	ContactEmailId: {
		doc: 'ContactEmailId',
		format: String,
		default: 'noreply@healthforyou-lidl.com'
	},
	sampleDoc: {
		doc: 'Sample Document',
		format: String,
		default: 'sample'
	},
	healthCheckSuccessMessage: {
		doc: 'Health Check Success Meassage',
		format: String,
		default: 'All the servers are working fine'
	},
	healthCheckFailureMessage: {
		doc: 'Health Check Failure Meassage',
		format: String,
		default: 'One or more servers are down'
	},
	elasticsearch: {
		host: {
			doc: 'host ip',
			format: String,
			default: '192.168.0.227:9200'
		},
		index: {
			doc: 'index name',
			format: String,
			default: 'sanitas'
		},
		typeName: {
			doc: 'Type Name',
			format: String,
			default: 'user'
		}
	},
	sitePath: {
		url: {
			doc: 'sentry url',
			format: 'String',
			default: 'https://cbe083feb6444bdeaf0c841c0490b2fe:5ca6f9b18910472d81b8d672898928a4@qa-healthcare.dynamic1001.com/1'
		}
	}
});

config.loadFile('./config-' + config.get('env') + '.json');

config.set('logger.httpLogFileName', config.get('logger.path') + config.get('logger.httpLogFileName'));
config.set('logger.logFileName', config.get('logger.path') + config.get('logger.logFileName'));
config.set('logger.exceptionLogFileName', config.get('logger.path') + config.get('logger.exceptionLogFileName'));

// validate
config.validate();

module.exports = config;