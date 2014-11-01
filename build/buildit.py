#! /usr/bin/env python

import os

module_name = 'jsredis'

def create_file():
    lib_content = []
    for i in os.listdir('lib'):
        lib_content.append(open('lib/%s' % i).read())

    for i in os.listdir('src'):
        lib_content.append(open('src/%s' % i).read())
        
    start = '''
var %s = (function() {
var %s_module = {};
%s_module.exports = {};
    
''' % (module_name, module_name, module_name)

    end = '''
    return %s_module.exports;
})();
''' % (module_name, )

    content = []

    for i in (start, '\n\n'.join(lib_content), end):
        content.append(i)
        content.append('\n\n')

    return content


if __name__ == '__main__':
    try:
        os.mkdir('build')
    except:
        pass

    f = open('build/%s.compiled.js' % module_name, 'w')
    f.write('\n'.join(create_file()))
    f.close()

    os.system('cat build/%s.compiled.js | jsmin > build/%s.min.js' % (module_name, module_name))

    print '\tcreated build/%s.compiled.js...' % module_name
    print '\tcreated build/%s.min.js...' % module_name
    print ''
