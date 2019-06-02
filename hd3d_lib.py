import random
import inspect, os
import json
from string import Template


def this_dir():
    this_file = inspect.getfile(inspect.currentframe())
    return os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))


def set_styles(css_file_names):
    if type(css_file_names) == str:
        style = open(this_dir() + '/css/' + css_file_names + '.css','r').read()
    else:
        style = ''
        for css_file_name in css_file_names:
            style += open(this_dir() + '/css/' + css_file_name + '.css','r').read()
    return "<style>" + style + "</style>"


def draw_graph(type, data_dict):

    JS_text = Template('''
    
                <div id='maindiv${divnum}'></div>
                
                <script>
                    $main_text
                </script>

                ''')

    divnum = int(random.uniform(0,9999999999))
    data_dict['divnum'] = divnum
    main_text_template = Template( open(this_dir() + '/js/' + type + '.js','r').read() )
    main_text = main_text_template.safe_substitute(data_dict)

    return JS_text.safe_substitute({'divnum': divnum, 'main_text': main_text})


def draw_hasse(type, data_dict):
    template_text = Template('''
<style>
    svg text {
        cursor: default;
	      fill: $textColor
    }
    svg line {
        stroke: $lineColor;
        stroke-width: 1;
    }
    #selectedBkg, #hd {
        overflow: auto;
    }
    #selectedBkg circle, #selectedBkg line {
        fill: $selectedBkgColor;
    }
    #selectedBkg line {
        stroke: $selectedBkgColor;
    }
    .tooltip {
        font-size: 20px;
    }
    
    #backgroundGradient {

          /* For Safari 5.1 to 6.0 */
    background: -webkit-linear-gradient(left,
    $bkgGradient1,
    $bkgGradient2); 
          /* For Opera 11.1 to 12.0 */
    background: -o-linear-gradient(left,
    $bkgGradient1,
    $bkgGradient2);  
          /* For Firefox 3.6 to 15 */
    background: -moz-linear-gradient(left, $bkgGradient1,
    $bkgGradient2); 
          /* Standard syntax (must be last) */  
    background: linear-gradient(to right, $bkgGradient1, 
    $bkgGradient2)); 
   }

</style>

                <div id='maindiv${divnum}'></div>
                <svg></svg>

                <script>
                    $main_text
                </script>

                ''')

    data_str = ''
    for key, value in data_dict.items():
        data_str += "var " + key + " = " + json.dumps(value) + ";\n"

    divnum = int(random.uniform(0, 9999999999))
    data_dict['divnum'] = divnum
    main_text_template = Template(open(this_dir() + '/js/' + type + '.js', 'r').read())
    main_text = main_text_template.safe_substitute({'data': data_str})
    data_dict['main_text'] = main_text
    return template_text.safe_substitute(data_dict)
