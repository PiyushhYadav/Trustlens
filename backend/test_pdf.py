from xhtml2pdf import pisa; open('test.svg', 'w').write('<svg width=\\\
100\\\ height=\\\100\\\ xmlns=\\\http://www.w3.org/2000/svg\\\><rect width=\\\100\\\ height=\\\100\\\ fill=\\\red\\\/></svg>'); pisa.CreatePDF('<html><body><img src=\\\test.svg\\\ /></body></html>', dest=open('test.pdf', 'wb'))
