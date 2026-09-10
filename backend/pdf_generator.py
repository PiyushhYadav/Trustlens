import os
import base64
from io import BytesIO
from jinja2 import Template
from xhtml2pdf import pisa
from datetime import datetime
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def generate_donut_chart(score):
    fig, ax = plt.subplots(figsize=(3, 3), dpi=150)
    color_primary = '#005dac'
    color_bg = '#e5e7eb'
    wedges, _ = ax.pie(
        [score, 100 - score],
        colors=[color_primary, color_bg],
        startangle=90,
        counterclock=False,
        wedgeprops=dict(width=0.15, edgecolor='w')
    )
    ax.axis('equal')
    plt.text(0, 0.1, str(score), horizontalalignment='center', verticalalignment='center', fontsize=40, fontweight='bold', color='#111827')
    plt.text(0, -0.2, '/ 100', horizontalalignment='center', verticalalignment='center', fontsize=12, color='#6b7280', fontweight='bold')
    plt.text(0, -0.4, 'TRUST SCORE', horizontalalignment='center', verticalalignment='center', fontsize=8, color='#6b7280', fontweight='bold')
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True, bbox_inches='tight', pad_inches=0)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{b64}"

def generate_trend_chart(trend_data):
    if not trend_data or len(trend_data) == 0:
        return ""
    if len(trend_data) < 12:
        trend_data = trend_data + [trend_data[-1]] * (12 - len(trend_data))
    elif len(trend_data) > 12:
        trend_data = trend_data[-12:]
        
    plt.figure(figsize=(7, 2), dpi=150)
    plt.plot(range(1, 13), trend_data, marker='o', markersize=5, color='#005dac', linewidth=2)
    plt.fill_between(range(1, 13), trend_data, alpha=0.1, color='#005dac')
    plt.ylim(0, 100)
    plt.xlim(1, 12)
    plt.xticks(range(1, 13), ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"], color='#6b7280', fontsize=8)
    plt.yticks([0, 20, 40, 60, 80, 100], color='#6b7280', fontsize=8)
    plt.grid(axis='y', linestyle='--', alpha=0.3)
    plt.grid(axis='x', linestyle='--', alpha=0.1)
    plt.gca().spines['top'].set_visible(False)
    plt.gca().spines['right'].set_visible(False)
    plt.gca().spines['left'].set_color('#e5e7eb')
    plt.gca().spines['bottom'].set_color('#e5e7eb')
    plt.tight_layout()
    
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{b64}"

def generate_bar_chart(score, max_score):
    # Generates a tiny progress bar image to bypass CSS limitations
    fig, ax = plt.subplots(figsize=(3, 0.1), dpi=150)
    ax.barh([0], [100], color='#f3f4f6', height=0.8)
    ax.barh([0], [(score/max_score)*100], color='#005dac', height=0.8)
    ax.set_xlim(0, 100)
    ax.axis('off')
    buf = BytesIO()
    plt.savefig(buf, format='png', transparent=True, bbox_inches='tight', pad_inches=0)
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return f"data:image/png;base64,{b64}"

REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {
        size: a4 portrait;
        margin: 2.5cm 1.5cm 2cm 1.5cm;
        @frame header {
            -pdf-frame-content: header_content;
            top: 1cm; margin-left: 1.5cm; margin-right: 1.5cm; height: 2cm;
        }
        @frame footer {
            -pdf-frame-content: footer_content;
            bottom: 1cm; margin-left: 1.5cm; margin-right: 1.5cm; height: 1cm;
        }
    }
    body {
        font-family: Helvetica, sans-serif;
        color: #1f2937;
        line-height: 1.4;
    }
    h1, h2, h3, h4 { color: #111827; margin: 0; padding: 0; }
    
    /* Header */
    .header-table { width: 100%; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
    .header-title { font-size: 14pt; font-weight: bold; color: #111827; }
    .header-subtitle { font-size: 9pt; color: #6b7280; }
    .header-meta { font-size: 8pt; color: #6b7280; text-align: right; }
    
    /* Hero */
    .hero-subtitle { font-size: 10pt; color: #4b5563; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px; }
    .hero-title { font-size: 38pt; font-weight: bold; color: #111827; margin-bottom: 10px; }
    .hero-desc { font-size: 12pt; color: #374151; margin-bottom: 20px; }
    .tags { font-size: 9pt; color: #4b5563; }
    .tag-item { background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-right: 10px; }
    
    /* Scores Box */
    .score-layout { width: 100%; margin-top: 30px; margin-bottom: 30px; }
    .grade-card { background-color: #fef9c3; padding: 20px; border-radius: 8px; border: 1px solid #fef08a; margin-bottom: 15px; }
    .grade-title { font-size: 18pt; font-weight: bold; color: #854d0e; margin-bottom: 5px; }
    .grade-desc { font-size: 10pt; color: #713f12; }
    
    .dpdp-card { background-color: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; }
    .dpdp-title { font-size: 11pt; font-weight: bold; color: #991b1b; }
    .dpdp-desc { font-size: 9pt; color: #7f1d1d; }
    
    /* About */
    .section-title { font-size: 14pt; font-weight: bold; color: #111827; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
    .about-box { background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 10pt; color: #334155; margin-bottom: 30px; }
    
    /* Signals Grid */
    .signals-grid { width: 100%; }
    .signal-card { background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .signal-header { width: 100%; margin-bottom: 5px; }
    .signal-name { font-size: 12pt; font-weight: bold; color: #111827; }
    .signal-score { font-size: 12pt; font-weight: bold; text-align: right; }
    .signal-bar { width: 100%; height: 6px; margin: 5px 0; }
    .signal-summary { font-size: 9pt; color: #4b5563; margin-top: 10px; height: 30px; }
    .signal-est { font-size: 7pt; font-weight: bold; background-color: #fef3c7; color: #92400e; padding: 2px 5px; border-radius: 3px; display: inline-block; float: right; margin-top: 5px; }
    .view-details { font-size: 9pt; color: #005dac; font-weight: bold; margin-top: 10px; }
    
    /* Page Break */
    .page-break { -pdf-pagebreak: true; }
    
    /* Trend */
    .trend-stats { width: 100%; margin-top: 20px; }
    .trend-stat-card { background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .trend-plus { font-size: 16pt; font-weight: bold; color: #005dac; }
    
    /* Action Steps */
    .action-step { width: 100%; margin-bottom: 15px; }
    .action-num { background-color: #005dac; color: #ffffff; font-weight: bold; font-size: 12pt; text-align: center; border-radius: 15px; width: 30px; height: 30px; line-height: 30px; display: inline-block; }
    .action-text { font-size: 10pt; color: #374151; padding-left: 15px; vertical-align: middle; }
    .action-green { background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 15px; border-radius: 8px; font-size: 10pt; text-align: center; margin-top: 20px; }
    
    /* Data Sources */
    .ds-card { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 15px; }
    .ds-title { font-size: 11pt; font-weight: bold; color: #111827; }
    .ds-badge-green { background-color: #dcfce7; color: #166534; padding: 3px 6px; font-size: 8pt; font-weight: bold; border-radius: 4px; }
    .ds-badge-yellow { background-color: #fef3c7; color: #92400e; padding: 3px 6px; font-size: 8pt; font-weight: bold; border-radius: 4px; }
    .ds-desc { font-size: 9pt; color: #4b5563; margin-top: 5px; }
</style>
</head>
<body>
    <!-- HEADER CONTENT -->
    <div id="header_content">
        <table class="header-table">
            <tr>
                <td width="50%" valign="middle">
                    <span class="header-title"><span style="color:#005dac; font-size:16pt;">&#9680;</span> TrustLens</span><br>
                    <span class="header-subtitle">Privacy &amp; Security Report</span>
                </td>
                <td width="50%" class="header-meta" valign="middle">
                    Generated on<br>
                    <span style="font-size:10pt; font-weight:bold; color:#111827;">{{ date }}</span><br>
                    Report ID: TL-{{ platform[:3].upper() }}-{{ date_id }}
                </td>
            </tr>
        </table>
    </div>
    
    <!-- FOOTER CONTENT -->
    <div id="footer_content">
        <table width="100%">
            <tr>
                <td width="50%">
                    <span style="font-size: 12pt; color:#005dac;">&#9680;</span> <span style="font-size: 9pt; font-weight:bold; color:#111827;">TrustLens</span><br>
                    <span style="font-size: 7pt; color:#6b7280;">Privacy &amp; Security for a Safer Internet</span>
                </td>
                <td width="50%" align="right" style="font-size: 9pt; color:#6b7280;" valign="bottom">
                    Page <pdf:pagenumber> of 3
                </td>
            </tr>
        </table>
    </div>

    <!-- PAGE 1: HERO & SIGNALS -->
    <p class="hero-subtitle">Company Report</p>
    <h1 class="hero-title">{{ platform.title() }}</h1>
    <p class="hero-desc">{{ data.description }}</p>
    
    <div class="tags">
        <span class="tag-item">&#127980; Platform</span>
        <span class="tag-item">&#127758; Global</span>
        <span class="tag-item">&#128279; {{ platform.lower() }}.com</span>
    </div>
    
    <table class="score-layout">
        <tr>
            <td width="45%" align="center" valign="middle">
                <img src="{{ donut_b64 }}" width="230" />
            </td>
            <td width="5%"></td>
            <td width="50%" valign="middle">
                <div class="grade-card" style="background-color: {{ '#dcfce7' if data.grade[0] in ['A','B'] else ('#fef08a' if data.grade[0]=='C' else '#fee2e2') }}; border-color: {{ '#bbf7d0' if data.grade[0] in ['A','B'] else ('#fde047' if data.grade[0]=='C' else '#fecaca') }};">
                    <div class="grade-title" style="color: {{ '#166534' if data.grade[0] in ['A','B'] else ('#854d0e' if data.grade[0]=='C' else '#991b1b') }};">Grade: <span style="font-size: 24pt;">{{ data.grade[0] }}</span></div>
                    <div class="grade-desc" style="color: {{ '#14532d' if data.grade[0] in ['A','B'] else ('#713f12' if data.grade[0]=='C' else '#7f1d1d') }};">
                        {{ data.grade_desc }}
                    </div>
                </div>
                
                <div class="dpdp-card" style="background-color: {{ '#dcfce7' if data.dpdp_compliant else '#fee2e2' }}; border-color: {{ '#bbf7d0' if data.dpdp_compliant else '#fecaca' }};">
                    <div class="dpdp-title" style="color: {{ '#166534' if data.dpdp_compliant else '#991b1b' }};">
                        &#9888; DPDP Act 2023: {{ 'Compliant' if data.dpdp_compliant else 'Non-Compliant' }}
                    </div>
                    <div class="dpdp-desc" style="color: {{ '#14532d' if data.dpdp_compliant else '#7f1d1d' }};">Based on our analysis of available data.</div>
                </div>
            </td>
        </tr>
    </table>
    
    <div class="section-title">&#127970; About {{ platform.title() }}</div>
    <div class="about-box">
        {{ data.description }}
    </div>
    
    <div class="section-title">&#128202; Signal Breakdown</div>
    <p style="font-size:9pt; color:#6b7280; margin-bottom:15px;">Detailed scores across key risk and trust factors.</p>
    
    <table class="signals-grid" cellspacing="10">
        <tr>
            <!-- Signal 1 -->
            <td width="50%" valign="top">
                <div class="signal-card">
                    <table class="signal-header">
                        <tr>
                            <td width="70%"><span class="signal-name">&#128272; Breach</span></td>
                            <td width="30%" class="signal-score">{{ data.signals.breach.score }}<span style="font-size:8pt; color:#6b7280;">/{{ data.signals.breach.max }}</span></td>
                        </tr>
                    </table>
                    <img src="{{ bar_b64.breach }}" class="signal-bar"/>
                    {% if data.signals.breach.is_fallback %}<div class="signal-est">EST.</div>{% endif %}
                    <div class="signal-summary">{{ data.signals.breach.summary }}</div>
                    <div class="view-details">View details &rarr;</div>
                </div>
            </td>
            <!-- Signal 2 -->
            <td width="50%" valign="top">
                <div class="signal-card">
                    <table class="signal-header">
                        <tr>
                            <td width="70%"><span class="signal-name">&#128196; Policy</span></td>
                            <td width="30%" class="signal-score">{{ data.signals.policy.score }}<span style="font-size:8pt; color:#6b7280;">/{{ data.signals.policy.max }}</span></td>
                        </tr>
                    </table>
                    <img src="{{ bar_b64.policy }}" class="signal-bar"/>
                    {% if data.signals.policy.is_fallback %}<div class="signal-est">EST.</div>{% endif %}
                    <div class="signal-summary">{{ data.signals.policy.summary }}</div>
                    <div class="view-details">View details &rarr;</div>
                </div>
            </td>
        </tr>
        <tr>
            <!-- Signal 3 -->
            <td width="50%" valign="top">
                <div class="signal-card">
                    <table class="signal-header">
                        <tr>
                            <td width="70%"><span class="signal-name">&#128737; Compliance</span></td>
                            <td width="30%" class="signal-score">{{ data.signals.compliance.score }}<span style="font-size:8pt; color:#6b7280;">/{{ data.signals.compliance.max }}</span></td>
                        </tr>
                    </table>
                    <img src="{{ bar_b64.compliance }}" class="signal-bar"/>
                    {% if data.signals.compliance.is_fallback %}<div class="signal-est">EST.</div>{% endif %}
                    <div class="signal-summary">{{ data.signals.compliance.summary }}</div>
                    <div class="view-details">View details &rarr;</div>
                </div>
            </td>
            <!-- Signal 4 -->
            <td width="50%" valign="top">
                <div class="signal-card">
                    <table class="signal-header">
                        <tr>
                            <td width="70%"><span class="signal-name">&#128172; Complaint</span></td>
                            <td width="30%" class="signal-score">{{ data.signals.review.score }}<span style="font-size:8pt; color:#6b7280;">/{{ data.signals.review.max }}</span></td>
                        </tr>
                    </table>
                    <img src="{{ bar_b64.review }}" class="signal-bar"/>
                    {% if data.signals.review.is_fallback %}<div class="signal-est">EST.</div>{% endif %}
                    <div class="signal-summary">{{ data.signals.review.summary }}</div>
                    <div class="view-details">View details &rarr;</div>
                </div>
            </td>
        </tr>
        <tr>
            <!-- Signal 5 -->
            <td colspan="2" valign="top">
                <div class="signal-card">
                    <table class="signal-header">
                        <tr>
                            <td width="85%"><span class="signal-name">&#128230; Tracker</span></td>
                            <td width="15%" class="signal-score">{{ data.signals.tracker.score }}<span style="font-size:8pt; color:#6b7280;">/{{ data.signals.tracker.max }}</span></td>
                        </tr>
                    </table>
                    <img src="{{ bar_b64.tracker }}" class="signal-bar"/>
                    {% if data.signals.tracker.is_fallback %}<div class="signal-est">EST.</div>{% endif %}
                    <div class="signal-summary">{{ data.signals.tracker.summary }}</div>
                    <div class="view-details">View details &rarr;</div>
                </div>
            </td>
        </tr>
    </table>
    
    <div style="background-color: #f8fafc; padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 8pt; color: #4b5563; margin-top: 10px;">
        &#9432; Scores are based on a combination of automated scanning and manual verification. They may not be exhaustive. <span style="color:#005dac;">Learn more about our methodology.</span>
    </div>

    <!-- PAGE 2: TREND & ACTIONS -->
    <div class="page-break"></div>
    
    <div class="section-title">&#128200; 12-Month Score Trend</div>
    <p style="font-size:9pt; color:#6b7280; margin-bottom:15px;">Track how {{ platform.title() }}'s trust score has changed over time.</p>
    
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center;">
        <img src="{{ trend_b64 }}" width="500"/>
    </div>
    
    <table class="trend-stats" cellspacing="10">
        <tr>
            <td width="50%" valign="top">
                <div class="trend-stat-card">
                    <table width="100%">
                        <tr>
                            <td width="20%" class="trend-plus" align="center">&#8599;</td>
                            <td width="80%">
                                <div class="trend-plus">+{{ data.trend[-1] - data.trend[0] if data.trend and data.trend[-1] >= data.trend[0] else data.trend[-1] - data.trend[0] }}%</div>
                                <div style="font-size:8pt; color:#6b7280;">vs. previous 12 months</div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td width="50%" valign="top">
                <div class="trend-stat-card">
                    <div style="font-size:10pt; color:#111827; padding-top: 5px;">Latest score is <b>{{ data.score }} out of 100.</b></div>
                </div>
            </td>
        </tr>
    </table>
    
    <div class="section-title" style="margin-top: 30px;">&#128161; Action Steps</div>
    <p style="font-size:9pt; color:#6b7280; margin-bottom:20px;">Practical steps to protect your privacy and data.</p>
    
    <table width="100%" cellspacing="0" cellpadding="0">
        {% for step in data.action_steps %}
        <tr>
            <td width="10%" valign="top" style="padding-bottom: 15px;">
                <div class="action-num">{{ loop.index }}</div>
            </td>
            <td width="90%" valign="middle" class="action-text" style="padding-bottom: 15px;">
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                    {{ step }}
                </div>
            </td>
        </tr>
        {% endfor %}
    </table>
    
    <div class="action-green">
        &#10004; Small steps can make a big difference in protecting your data.
    </div>
    
    <!-- PAGE 3: DATA SOURCES -->
    <div class="page-break"></div>
    
    <div class="section-title">&#128248; Data Sources &amp; Verification</div>
    <p style="font-size:9pt; color:#6b7280; margin-bottom:20px;">We collect and verify information from multiple trusted sources to ensure an unbiased and accurate analysis.</p>
    
    {% for key, signal in data.signals.items() %}
    <div class="ds-card">
        <table width="100%">
            <tr>
                <td width="10%" valign="top" align="center">
                    <span style="font-size:18pt; color:#005dac;">
                        {% if key == 'breach' %}&#128272;
                        {% elif key == 'policy' %}&#128196;
                        {% elif key == 'compliance' %}&#128737;
                        {% elif key == 'review' %}&#128172;
                        {% else %}&#128230;{% endif %}
                    </span>
                </td>
                <td width="65%" valign="top" style="padding-left:10px;">
                    <div class="ds-title">{{ key.replace('_', ' ').title() }}</div>
                    <div class="ds-desc">{{ signal.summary }}</div>
                    <div class="view-details" style="font-size:8pt; margin-top: 5px;">View source &rarr;</div>
                </td>
                <td width="25%" valign="top" align="right">
                    {% if signal.is_fallback %}
                        <span class="ds-badge-yellow">&#9888; Fallback</span>
                    {% else %}
                        <span class="ds-badge-green">&#10004; Verified</span>
                    {% endif %}
                </td>
            </tr>
        </table>
    </div>
    {% endfor %}
    
    <div style="background-color: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 8pt; color: #4b5563; margin-top: 20px;">
        &#9432; We use a combination of automated scanning and manual verification to ensure accuracy. <span style="color:#005dac;">Learn more about our methodology.</span>
    </div>

</body>
</html>
"""

def generate_pdf_report(platform: str, data: dict) -> BytesIO:
    trend_b64 = generate_trend_chart(data.get("trend", []))
    donut_b64 = generate_donut_chart(data.get("score", 0))
    
    bar_b64 = {}
    for k, v in data.get("signals", {}).items():
        bar_b64[k] = generate_bar_chart(v.get("score", 0), v.get("max", 15))
        
    date_str = datetime.now().strftime("%B %d, %Y")
    date_id = datetime.now().strftime("%Y%m%d")
    
    template = Template(REPORT_TEMPLATE)
    html_content = template.render(
        platform=platform,
        data=data,
        trend_b64=trend_b64,
        donut_b64=donut_b64,
        bar_b64=bar_b64,
        date=date_str,
        date_id=date_id
    )
    
    pdf_buffer = BytesIO()
    pisa_status = pisa.CreatePDF(
        html_content,
        dest=pdf_buffer
    )
    
    if pisa_status.err:
        raise Exception(f"PDF generation failed: {pisa_status.err}")
        
    pdf_buffer.seek(0)
    return pdf_buffer
