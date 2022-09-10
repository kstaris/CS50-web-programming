from django.contrib.humanize.templatetags.humanize import intcomma

def currency(euro):
    euro = round(float(euro), 2)
    return "€%s%s" % (intcomma(int(euro)), ("%0.2f" % euro)[-3:])

