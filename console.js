(function (global, FunctionToString, ObjectHasOwnProperty, ObjectToString) {
	/* jshint boss:true,evil:true */

	if (global.console || !global.attachEvent) {
		return;
	}

	/* Cookie
	/* ====================================================================== */

	function cookie_fetch(name) {
		return (document.cookie.match('console.' + name + '=(.*?)(;|$)') || ['', null])[1];
	}

	function cookie_write(name, value) {
		document.cookie = 'console.' + name + '=' + value + ';expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/';
	}

	/* History
	/* ====================================================================== */

	function history_fetch() {
		var
		history_string = cookie_fetch('history') || '',
		history_array = history_string ? history_string.split(',') : [],
		history_length = history_array.length,
		history_index = -1;

		while (++history_index < history_length) {
			history_array[history_index] = decodeURIComponent(history_array[history_index]);
		}

		return history_array;
	}

	function history_index(index) {
		if (0 in arguments) {
			cookie_write('historyindex', index);
		}

		return parseInt(cookie_fetch('historyindex')) || 0;
	}

	function history_write(array) {
		var
		history_array = [],
		index = -1;

		array = array.slice(-8);

		while (++index in array) {
			if (array[index].length < 384) {
				history_array.push(encodeURIComponent(array[index]));
			}
		}

		cookie_write('history', history_array.join(','));
	}

	/* Helpers
	/* ====================================================================== */

	function isNativeFunction(source) {
		try {
			return typeof source === 'object' && !('toString' in source) && String(source) !== '[object]';
		} catch (error) {}
	}

	function isArray(source) {
		try {
			return ObjectToString.call(source) === '[object Array]';
		} catch (error) {}
	}

	function getObjectName(source) {
		try {
			return 'constructor' in source ? (FunctionToString.call(source.constructor).match(/function(?:\s+([^(\s]+))?/) || ['', ''])[1].replace(/^Object$/, '') + ' ' : '';
		} catch (error) {
			return '';
		}
	}

	/* Element
	/* ====================================================================== */

	function element_append(node) {
		var
		document = node.document || node,
		length = arguments.length,
		index = 0,
		argument, childNode;

		while (++index < length) {
			argument = arguments[index];

			if (argument instanceof Array) {
				childNode = element_config(document.createElement(argument.shift()));

				element_append.apply(null, [childNode].concat(argument));
			} else if (typeof argument === 'string') {
				childNode = document.createTextNode(argument);
			} else {
				childNode = argument;
			}

			node.appendChild(childNode);
		}

		return childNode || node;
	}

	function element_config(node) {
		var
		name = node.nodeName.toLowerCase().replace(/[^a-z]/g, ''),
		config = configs[name] || {},
		nodeStyle = node.runtimeStyle,
		key;

		for (key in config.attribute) {
			node.setAttribute(key, config.attribute[key]);
		}

		for (key in config.event) {
			node.attachEvent('on' + key, config.event[key]);
		}

		for (key in config.style) {
			nodeStyle[key] = String(config.style[key]);
		}

		return node;
	}

	function create(source, isDeep) {
		var
		fragment = frame.document.createDocumentFragment(),
		expander, hadLast, key, length, subfragment;

		// undefined
		if (source === undefined) {
			element_append(fragment, ['type-undefined', 'undefined']);
		}
		// null
		else if (source === null) {
			element_append(fragment, ['type-null', 'null']);
		}

		// boolean
		else if (typeof source === 'boolean') {
			element_append(fragment, ['type-boolean', source ? 'true' : 'false']);
		}
		// function
		else if (typeof source === 'function' || isNativeFunction(source)) {
			element_append(fragment, ['type-function', String(source).replace(/^\s+|\s+$/g, '').replace(/\r?\n/g, '\r')]);
		}
		// number
		else if (typeof source === 'number') {
			element_append(fragment, ['type-number', String(source)]);
		}
		// string
		else if (typeof source === 'string') {
			element_append(fragment, '"', ['type-string', source], '"');
		}
		// array
		else if (isArray(source)) {
			subfragment = element_append(fragment, ['type-array', '[']);

			if (isDeep) {
				try {
					key = -1;
					length = source.length;

					while (++key < length) {
						element_append(subfragment, hadLast ? ', ' : '');

						element_append(subfragment, create(source[key], false));

						hadLast = true;
					}
				} catch (error) {}
			} else {
				expander = element_append(subfragment, ['type-expandable', ' + ']);

				expander.source = source;
			}

			element_append(subfragment, ']');
		} else {
			if (isDeep) {
				subfragment = element_append(fragment, ['type-object', getObjectName(source), '{']);
			} else {
				subfragment = element_append(fragment, ['type-object', '{']);
			}

			if (isDeep) {
				for (key in source) {
					try {
						if (ObjectHasOwnProperty.call(source, key)) {
							element_append(subfragment, hadLast ? ', ' : ' ');

							element_append(subfragment, ['type-key', key]);
							element_append(subfragment, ': ');

							element_append(subfragment, create(source[key], false));

							hadLast = true;
						}
					} catch (error) {}
				}
			} else {
				expander = element_append(subfragment, ['type-expandable', ' + ']);

				expander.source = source;
			}

			if (hadLast) {
				element_append(subfragment, ' ');
			}

			element_append(subfragment, '}');
		}

		return fragment;
	}

	/* Console
	/* ====================================================================== */

	function console_clear() {
		while (frame.output.lastChild) {
			frame.output.removeChild(frame.output.lastChild);
		}
	}

	function console_log(items) {
		var
		length = items.length,
		index = -1,
		fragment = frame.document.createDocumentFragment(),
		pre = element_append(fragment, ['pre']),
		hadLast, value;

		while (++index < length) {
			if (hadLast) {
				element_append(pre, ', ');
			}

			element_append(pre, create(items[index], true));

			hadLast = true;
		}

		element_append(frame.output, pre);

		frame.body.scrollTop = 99999;

		return pre;
	}

	function console_log_from_field(value) {
		var
		pre = element_append(frame.output, ['pre', ['type-console', value]]);

		pre.runtimeStyle.borderBottomColor = '#FFF';

		element_append(pre, ['console-badge']).runtimeStyle.backgroundPosition = '20px 0px';

		try {
			console_log([ new Function('arguments=this.arguments;return eval("' + value.replace(/"/g, '\\"') + '")')() ]);

			var pre2 = frame.output.lastChild;

			element_append(pre2, ['console-badge']).runtimeStyle.backgroundPosition = '10px 0px';
		}
		// if any part of the log failed
		catch (error) {
			console_error([error.message], error);
		}
	}

	function console_focus() {
		if (frame.display) {
			var
			field = frame.field,
			textRange = field.createTextRange();

			if (frame.document.activeElement !== field) {
				field.focus();
			}

			textRange.moveStart('character', field.value.length);

			textRange.collapse();

			textRange.select();
		}
	}

	function console_resize(height) {
		height = Math.max(Math.min(0 in arguments ? height : Math.max(frame.runtimeHeight || 0, frame.height), frame.clientHeight - 22), 22);

		if (height !== frame.runtimeHeight) {
			frame.runtimeHeight = height;

			frame.iframeStyle.height = height + 'px';
		}
	}

	function console_onresize() {
		frame.clientHeight = document.documentElement.clientHeight;
		frame.clientWidth = document.documentElement.clientWidth;

		console_resize();
	}

	function console_display(shouldDisplay) {
		var isDisplayed = frame.display;

		if (isDisplayed !== shouldDisplay) {
			console_onresize();

			console_focus();

			frame.consoleStyle.clip = 'rect(' + (shouldDisplay ? 'auto auto auto auto' : '0 0 0 0') + ')';

			console_focus();

			cookie_write('display', frame.display = shouldDisplay);
		}
	}

	function getErrorType(error) {
		return error instanceof EvalError ? 'EvalError'
		: error instanceof RangeError ? 'RangeError'
		: error instanceof ReferenceError ? 'ReferenceError'
		: error instanceof SyntaxError ? 'SyntaxError'
		: error instanceof TypeError ? 'TypeError'
		: error instanceof URIError ? 'URIError'
		: 'Error';
	}

	function console_error(messages, error) {
		var
		pre = element_append(frame.output, ['pre']),
		output = element_append(pre, ['type-error']),
		length = messages.length,
		index = -1;

		element_append(output, getErrorType(error), ': ');

		while (++index < length) {
			element_append(output, String(messages[index]));
		}

		element_append(pre, ['console-badge']).runtimeStyle.backgroundPosition = '40px 0px';
	}

	function console_info(messages) {
		var
		pre = element_append(frame.output, ['pre']),
		output = element_append(pre, ['type-info']),
		length = messages.length,
		index = -1;

		while (++index < length) {
			element_append(output, String(messages[index]));
		}

		element_append(pre, ['console-badge']).runtimeStyle.backgroundPosition = '60px 0px';
	}

	function console_warn(messages) {
		var
		pre = element_append(frame.output, ['pre']),
		output = element_append(pre, ['type-warn']),
		length = messages.length,
		index = -1;

		while (++index < length) {
			element_append(output, String(messages[index]));
		}

		element_append(pre, ['console-badge']).runtimeStyle.backgroundPosition = '50px 0px';
	}

	function console_table(args) {
		var
		data = args[0],
		show = args[1],
		pre = element_append(frame.output, ['pre']),
		fragment = frame.document.createDocumentFragment(),
		keys = {},
		index = -1,
		item, key, table, thead, tbody, tr;

		table = element_append(fragment, ['table']);
		thead = element_append(table, ['thead']);

		tr = element_append(thead, ['tr']);

		element_append(tr, ['th', '(index)']);

		if (show) {
			while (++index in show) {
				key = show[index];

				keys[key] = true;

				element_append(tr, ['th', key]);
			}
		} else {
			while (++index in data) {
				item = data[index];

				for (key in item) {
					if (!(key in keys)) {
						keys[key] = true;

						element_append(tr, ['th', key]);
					}
				}
			}
		}

		tbody = element_append(table, ['tbody']);

		index = -1;

		while (++index in data) {
			item = data[index];

			tr = element_append(tbody, ['tr']);

			element_append(tr, ['td', create(index)]).runtimeStyle.backgroundColor = index % 2 ? '#EAF3FF' : '#FFF';

			for (key in keys) {
				if (key in item) {
					element_append(tr, ['td', create( item[key] )]).runtimeStyle.backgroundColor = index % 2 ? '#EAF3FF' : '#FFF';
				}
			}
		}

		element_append(pre, table);

		// console_log(fields);
	}

	function console_onscroll() {
		if (!console_onscroll.timeout) {
			console_onscroll.timeout = setTimeout(function () {
				frame.consoleStyleToggle = frame.consoleStyleToggle ? 0 : 1;

				frame.consoleStyle.bottom = frame.consoleStyleToggle + 'px';
				frame.consoleStyle.marginBottom = -frame.consoleStyleToggle + 'px';
				frame.consoleStyle.position = 'absolute';
				frame.consoleStyle.width = frame.clientWidth + 'px';

				console_onscroll.timeout = null;
			});
		}
	}

	/* window.console
	/* ====================================================================== */

	function Console() {}

	Console.prototype = {
		constructor: Console,
		clear: function clear() { console_clear(); },
		debug: function debug() { console_log(arguments); },
		error: function error() { console_error(arguments); },
		dir: function dir() { console_log(arguments); },
		info: function info() { console_info(arguments); },
		log: function log() { console_log(arguments); },
		warn: function warn() { console_warn(arguments); },
		table: function table() { console_table(arguments); }
	};

	window.console = new Console();

	/* On Ready
	/* ====================================================================== */

	function onready() {
		if (!document.body) {
			return setTimeout(onready);
		}

		document.body.appendChild(frame.console);
	}

	var

	/* Configs
	/* ====================================================================== */

	configs = {
		document: {
			event: {
				keydown: function (event) {
					// reload (CTRL+R)
					if (event.ctrlKey && event.keyCode === 82) {
						window.reload();
					}
					// toggle (CTRL+SHIFT+I, F12)
					else if ((event.ctrlKey && event.altKey && event.keyCode === 73) || (event.keyCode === 123)) {
						console_display(!frame.display);

						event.returnValue = false;
					}
				}
			}
		},
		console: {
			style: {
				bottom: 0,
				clip: 'rect(0 0 0 0)',
				left: 0,
				position: 'fixed',
				right: 0,
				width: '100%'
			}
		},
		consolehandle: {
			event: {
				mousedown: function (event) {
					var
					max = document.documentElement.clientHeight - 22,
					screenY = event.screenY,
					onmousemove = function (event) {
						console_resize(frame.height + screenY - event.screenY);

						event.returnValue = false;
					},
					onmouseup = function (event) {
						frame.document.detachEvent('onmousemove', onmousemove);
						frame.document.detachEvent('onmouseup', onmouseup);

						document.detachEvent('onmousemove', onmousemove);
						document.detachEvent('onmouseup', onmouseup);

						document.documentElement.runtimeStyle.cursor = '';

						cookie_write('height', frame.height = frame.runtimeHeight);

						event.returnValue = false;
					};

					frame.document.attachEvent('onmousemove', onmousemove);
					frame.document.attachEvent('onmouseup', onmouseup);

					document.attachEvent('onmousemove', onmousemove);
					document.attachEvent('onmouseup', onmouseup);

					document.documentElement.runtimeStyle.cursor = 'n-resize !important';

					event.returnValue = false;
				}
			},
			style: {
				backgroundColor: '#E6E6E6',
				border: '0 solid #A3A3A3',
				borderWidth: '1px 0',
				cursor: 'n-resize',
				display: 'block',
				height: '22px',
				margin: 0
			}
		},
		consoleclose: {
			event: {
				mousedown: function (event) {
					console_display(false);

					event.returnValue = false;
				}
			},
			style: {
				backgroundColor: '#E6E6E6',
				color: '#676767',
				cursor: 'pointer',
				font: '700 18px/22px monospace',
				position: 'absolute',
				right: 0,
				textAlign: 'center',
				width: '18px',
				zoom: 1
			}
		},
		consolebadge: {
			style: {
				background: 'url(//i.imgur.com/KrXVuLo.png)',
				display: 'block',
				left: '-17px',
				fontSize: '0',
				height: '10px',
				position: 'absolute',
				top: '3px',
				width: '10px',
				zoom: 1
			}
		},
		iframe: {
			attribute: {
				frameBorder: 0
			},
			event: {
				focus: console_focus
			},
			style: {
				margin: 0,
				width: '100%'
			}
		},
		body: {
			event: {
				click: function (event) {
					if (event.srcElement === frame.body) {
						console_focus(true);
					}
				}
			},
			style: {
				margin: 0,
				padding: '2px 0 0',
				overflowX: 'hidden',
				overflowY: 'auto'
			}
		},
		input: {
			event: {
				focus: console_focus,
				keydown: function (event) {
					configs.document.event.keydown(event);

					var
					history_array = history_fetch(),
					index, value;

					// return
					if (event.keyCode === 13) {
						if (value = frame.field.value.replace(/^\s+|\s+$/g)) {
							if (value !== history_array[history_array.length - 1]) {
								history_array.push(value);

								history_write(history_array);
							}

							index = history_index(history_array.length) - 1;

							console_log_from_field(value);
						}

						frame.field.value = '';
					}
					// last (up)
					else if (event.keyCode === 38) {
						index = history_index(Math.max(history_index() - 1, 0));

						frame.field.value = history_array[index] || '';
					}
					// next (down)
					else if (event.keyCode === 40) {
						index = history_index(Math.min(history_index() + 1, history_array.length));

						frame.field.value = history_array[index] || '';
					}
					// clear (CTRL+K)
					else if (event.ctrlKey && event.keyCode === 75) {
						console_clear();

						event.returnValue = false;
					}
				},
				keyup: function (event) {
					cookie_write('current', frame.field.value);					
				}
			},
			style: {
				backgroundColor: '#FFF',
				border: 0,
				borderBottom: '1px solid #FFF',
				color: '#303942',
				cursor: 'default',
				display: 'block',
				font: '12px/15px monospace',
				padding: 0,
				position: 'relative',
				top: '-1px',
				width: '100%'
			}
		},
		pre: {
			style: {
				borderBottom: '1px solid #EEE',
				color: '#303942',
				font: '12px/15px monospace',
				margin: 0,
				padding: 0,
				position: 'relative',
				zoom: 1
			}
		},
		section: {
			style: {
				display: 'block',
				margin: 0,
				overflow: 'hidden',
				padding: '0 22px',
				position: 'relative'
			}
		},
		table: {
			style: {
				border: '1px solid #AAA',
				borderCollapse: 'collapse',
				color: '#303942',
				font: '12px/15px monospace',
				width: '100%'
			}
		},
		th: {
			style: {
				backgroundColor: '#ECECEC',
				border: '1px solid #AAA',
				fontWeight: 400,
				padding: '0 4px',
				textAlign: 'left'
			}
		},
		td: {
			style: {
				backgroundColor: '#FFF',
				border: '0 solid #AAA',
				borderWidth: '0 1px',
				padding: '0 4px',
				textAlign: 'left'
			}
		},

		typeboolean: {
			style: {
				color: '#1C00CF'
			}
		},
		typeconsole: {
			style: {
				color: '#0080FF'
			}
		},
		typeerror: {
			style: {
				color: '#F00',
				zoom: 1
			}
		},
		typefunction: {
			style: {
				color: '#060'
			}
		},
		typekey: {
			style: {
				color: '#A2A'
			}
		},
		typenull: {
			style: {
				color: '#808080'
			}
		},
		typenumber: {
			style: {
				color: '#1C00CF'
			}
		},
		typeobject: {
			style: {
				zoom: 1
			}
		},
		typestring: {
			style: {
				color: '#C41A16'
			}
		},
		typeundefined: {
			style: {
				color: '#808080'
			}
		},

		typeexpandable: {
			event: {
				click: function (event) {
					var
					node = event.srcElement,
					parentNode = node.parentNode,
					grandNode = parentNode.parentNode;

					grandNode.replaceChild(create(node.source, true), parentNode);
				}
			},
			style: {
				color: '#808080',
				cursor: 'pointer'
			}
		}
	},

	/* Frame
	/* ====================================================================== */

	frame = {},

	/* Initialize
	/* ====================================================================== */

	fragment = document.documentElement.appendChild(document.createElement('body'));

	frame.console = element_append(fragment, ['console']);
	frame.handle = element_append(frame.console, ['console-handle']);
	frame.iframe = element_append(frame.console, ['iframe']);
	frame.close = element_append(frame.handle, ['console-close']);

	frame.close.innerHTML = '&times;';

	frame.iframeStyle  = frame.iframe.runtimeStyle;
	frame.consoleStyle = frame.console.runtimeStyle;

	frame.window = frame.iframe.contentWindow;
	frame.document = frame.window.document;

	frame.document.write('<script></' + 'script>');
	frame.document.close();

	document.documentElement.removeChild(fragment);

	frame.body = element_config(frame.document.body);

	frame.height = parseInt(cookie_fetch('height')) || 224;
	frame.clientHeight = document.documentElement.clientHeight;
	frame.clientWidth = document.documentElement.clientWidth;

	element_config(document);

	frame.output = element_append(frame.body, ['section']);
	frame.input  = element_append(frame.body, ['section']);
	frame.field  = element_append(frame.input, ['input']);

	frame.field.value = cookie_fetch('current') || '';

	element_append(frame.input, ['console-badge']).runtimeStyle.backgroundPosition = '30px 0px';

	global.attachEvent('onresize', console_onresize);

	if (/MSIE 6.0/.test(navigator.userAgent)) {
		global.attachEvent('onresize', console_onscroll);
		global.attachEvent('onscroll', console_onscroll);
	}

	console_display(cookie_fetch('display') === null ? true : cookie_fetch('display') === 'true');

	onready();
})(this, Function.prototype.toString, Object.prototype.hasOwnProperty, Object.prototype.toString);
