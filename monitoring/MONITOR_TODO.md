### Backend configuration
- [x] auth
- [x] game
- [x] tournament
- [x] user
- [x] websocket
- [] Add hook on gateway to prevent `http://localhost:4443/<service>/metrics` exposition

### Completing setup
- [x] Prometheus configuration
- [] Grafana configuration
- [] Creating dashboards .json
- [x] Altermanager
- [x] data retention ans storage
- [] secure connection between component
- [] control mecansim for sensible datas (grafana)
- [x] rule files into prometheus.yml ??

### Adds
- [x] cAdvisor (docker metrics)
- [] nginx-exporter if reverseproxy
- [] databases metrics
- [] Remove ports from prometheus container
- [] check if auto-monitoring prometheus is not a secured issue (`localhost:9000`)
- [x] Monitor ELK as well
- [] monitor front as well
- [] Check https conenction (prom, alert, grafana)
- [] Check if telegraf is scrapping the good metrics (test in production)


---
### MONITORING DOCUMENTATION

#### Prometheus
#### Exporters

Seuls les exporters communiquent avec les sous réseaux des services qu'ils surveillent. Le fait qu'il soient sur le subnetowrk monitoring permet donc à Prometheus, alertmanager et grafana de ne pas avoir accès aux différents services de l'architecture mais bien qu'à leur metrics exposées, ce qui limite les point d'entrée et garanti une bonne isolation. En revanche l'utilisation de fastify-metrics sur chaque service fait qu'il est plus sécurisé de donner à prometheus un accès à Backend que chaque service n'ai accès au network monitoring (on veux que les services restent isolés du monitoring) 

We choose to use fastify-metrics, using the official prom-client under the hook but offer's us an abstact level adapted to the framework we're using (with, automatic `/metrics` routes and automatic HTTP metrics.
```javascript
await app.register(fastifyMetrics, {
  endpoint: '/metrics'
});

```
Ainsi on expose les metrics de chaque service sur une route et Prometheus va pouvoir scrapper ces données en faisant des requetes HTTP GET vers la route. On ne passe pas par le Gateway pour ne pas avoir de latence supplémentaire qui pourrait fausser les metrics.

En production, la stack ELK serait plutot surveillée via l'écosystème Elastic natif (Metricbeat + Stack Monitoring). Or le sujet nous demmandant de monitorer nos components et notre archi avec Prometheus, nous avons utilsé l'exporter elasticsearch maintenu par la communatué prometheus en complément de Telegraf qui sert de collecteur de mtrics (JSON) des éléments du pipeline (Filebeat et Logstash) et les format en PromQL. Ce collecteur très mature et largement utilisé en entreprise. Il supporte nativement Logstash et Filebeat et expose les métriques pour Prometheusi.

Ici on ajoute une serveillance de Telegraf lui meme dans les metrics car on est sur une petite architecture. Une sureveillance du container sera necessaire et en cas de trop de ressources requises, on pourra mettre en place une resilience et un buffer pour prévenir les pertes de metrics en cas de crash.


Comme nous utilisons Sqlite comme database pour simplifier le stockage, il n'y a pas de serveur à surveiller ou interroger. Monitorer notre DB avec des exporters customs risqueait de: alourdir le code du backend, mais surtout de bloquer le fichier de DB à chaque inspection du monitoring. Ainsi nous aurions obtenu peu de metrics (car espacées dans le temps) tout en augmentant le nombre de requetes sur la DB.

#### Data retention and storage strategies
Config simple, car tournera peut de temps (6GB dispo pour tous les services) évite de saturer docker. Prometheus supprimera les blocs les plus anciens du TSBD pour atteindre 1GB ou e pas conserver de metrics qui datent de plus de 7 jours. La persistence du volume docker en local suffit à gérer la persistence de données en cas de relance de services. Pour ce projet étudiant qui tournera quqleues heures en corrections on ne fera pas de snapshots.
La compression du WAL est de son côté automatiquement enable sur les versions post 2.20.0, et permet de compresser le journal d'écriture et de le portéger en cas de crash de prometheus. 


#### Alertmanager
Stocke les alertes et les envoit vers discord via l webhook. Gère le https tout seul. Il est ici exposé en local 127.0.0.1:9093:9093 pour monitorer les alertes

Comme alertmanager et prometheus sont en busybox il ne gère pas les ${VAR} donc nous avons du créer un Dockerfile custom qui avec alpine et sh fait une substitution des variables dans le fichier. Anisi notre webhook et notre mdp encrypté peuvent etre spécifiés dans un .env et rester en privé.
Sur des grosses prods, des outils comme kubernetees secrets sont utilisés.

#### Grafana



### Doc
- [Fasttify-metrics Offical Documentation](https://www.npmjs.com/package/fastify-metrics?activeTab=readme)
- [Prometheus Official Documentation](https://prometheus.io/docs/prometheus/latest/getting_started/)
- [Alterting philosophy by Bob Ewaschuk from observations at Google](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit?pli=1&tab=t.0#heading=h.fs3knmjt7fjy)
- [Github issue for variable substitution](https://github.com/prometheus/prometheus/issues/2357)
- [Official Telemetry Documentation](https://github.com/influxdata/telegraf/tree/master)
- [Official Elasticsearch-exporter Documentation](https://github.com/prometheus-community/elasticsearch_exporter)
- [Official CadvisorDocumentation](https://github.com/google/cadvisor)
- [Official Grafana Documentation](https://grafana.com/docs/grafana/latest/)
