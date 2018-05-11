# Motivation
Die Digitalisierung erfordert eine laufende Veränderung des Produktions- und Wertschöp-
fungsprozesses. Jedoch gibt es hier für die kleine- und mittelständische Unternehmen (KMU)
große Herausforderungen im Rahmender Industrie 4.0 zu meistern. Lediglich fünf Prozent der
KMU sind ausreichend vernetzt, wobei ca. 30 Prozent der KMU ein Konzept oder sogar
konkrete erste Pläne für die Vernetzung und Einführung von Industrie 4.0 vorsehen. Im
Vergleich zu Großunternehmen verfolgen lediglich halb so viele KMU eine Industrie 4.0
Strategie. Durch den andauernden wirtschaftlichen und technischen Fortschritt stehen KMU
ebenfalls unter Druck. Ein verpasster Anschluss an die Digitalisierung durch Industrie 4.0
könnte die internationale Wettbewerbsfähigkeit gefähreden. Ebenso drängen Großkonzerne die
KMU, mit denen sie zusammenarbeiten dazu, ihre Produktionsschritte zu automatisieren und
zu vernetzen.

Von der Industrie 4.0 wird ein durchaus positives wirtschaftliches Wachstum erwartet. Somit
werden durch die Automatisierung von Arbeitsprozessen bis 2020 zusätzliche Umsätze von 20
bis 30 Mrd. Euro pro Jahr erwartet. Durch die Cloud-Umgebung können reale
Produktionsprozesse virtuell abgebildet, überwacht und bearbeitet werden. Durch diese
dezentralisierte Echtzeitproduktion sollen Kosten gesenkt werden. In verschiedensten
Bereichen lassen sich Kosten von zehn bis 70 Prozent einsparen. So können
Komplexitätskosten schätzungsweise von 60 bis 70 Prozent reduziert werden, wobei
Fertigungs- und Logistigkosten nur eine geringe Kostenersparnis zulassen.

Kleine und mittelständische Unternehmen investieren im Schnitt rund 4,5 % ihres Umsatzes in
die IT. In Großunternehmen sind lediglich 2,5 % IT-Ausgaben. Diese Differenz lässt sich zum
größten Teil auf die geringen Angebote für KMU zurückführen. Resultierend aus diesen
geringeren Angeboten für den Mittelstand leidet auch das Know-How der mittelständischen IT-
Abteilung. Den KMU fehlen die Kapazitäten weitere IT-Fachkräfte einzustellen. Die bereits
oben beschriebenen Komponenten eines Internet der Dinge (IoT engl. Internet of Things)
arbeiten jedoch auf verschiedenen Platformen, somit entsteht eine Hürde für den
Mittelstand.nUm eine Digitalisierung in Form von Industrie 4.0 gewährleisten zu können,
müssen die verschiedenen Platformen angesprochen werden können. Dies erfordert das Know-
How, das viele KMU derzeit nicht haben.

# Zielsetzung

Das Ziel dieser Bachelorarbeit ist das Design einer Schnittstelle zum Deployen von Software
für unterschiedliche Platformen. Diese Platformen lassen sich in vier Bereiche gliedern:
Embedded systems, Industrierechner. Desktoprechner, Virtualisierte Umgebungen. Die
Komponenten können an verschiedene Sensoren oder Nutzmaschinen angeschlossen werden
und verfügen über Wifi-Module oder eine Netzwerk-Schnittstelle, sodass sie sich im Netzwerk
anmelden können. Dem Entwickler soll es ermöglicht werden, diese Geräte über eine
programmierte Schnittstelle anzusprechen um ihre Software auf dem Laufzeitsystem zu
deployen. Jede Hardwarekomponente wird durch ein separates Modul gelfasht, das von der
Schnittstelle bereitgestellt wird. Es entstehen somit verschiende Microservices die unabhängig
voneinander arbeiten und programmiert werden können. Mit den geflashten Laufzeitsystemen
soll über den Cloudservice eine Industrie 4.0 Umgebung simuliert werden, die für
Mittelständische Unternehmen derzeit stark an Bedeutung gewinnt. Durch die Schnittstelle soll
dem Entwickler die direkte Programmierung abgenommen werden und er sich somit lediglich
auf die für ihn relevante Programmierung beschränken kann. Über eine Web-Applikation kann
der Entwickler seinen Code bereitstellen und optional zusätzliche Features wie Monitoring und
den Gebrauch von Datenbanken angeben. Log- und Monitoring-Informationen der
Microservices können über diese Web-App ebenfalls abgerufen werden. Die Umsetzung dieser
Module erfolgt auf Grundlage von Containern der Docker-Software. Diese Container können
ebenfalls über die Web-App gestartet und beendet werden. Mit Hilfe von Cross-Cutting-
Concerns werden zusätzliche Loginformationen neben des manuellen, durch den Entwickler
geforderten, Loggings übertragen. Prozessorauslastung und Speicherauslastung werden
permanent übertragen. Neben des Proof-of-concept anhand von einem ESP8266, einem
Raspberry Pi 3 und einem Xiamoi SQJR00RR umfasst der praktische Teil der Bachelorarbeit
eine Evaluation für die Nützlichkeit und Fehleranfälligkeit dieser Schnittstelle und der
Vereinfachung durch diese mit verschiedenen Entwicklern.


# Webbuilder

# Module 

# Laufzeitsysteme
Es wurden drei Module implementiert, die für spezielle Laufzeitsysteme vorgesehen sind. Hierfür benutzen wir ein ESP8266, ein RaspberryPi 3 und den Xiaomi Vaccum Cleaner XJRQ01RR.

