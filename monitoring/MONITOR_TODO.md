### Backend configuration
- [x] auth
- [x] game
- [x] tournament
- [x] user
- [x] websocket
- [] Add hook on gateway to prevent `http://localhost:4443/auth/metrics` exposition

### Completing setup
- [] Prometheus configuration
- [] Grafana configuration
- [] Creating dashboards .json
- [x] Altermanager
- [x] data retention ans storage
- [] secure connection between component
- [] control mecansim for sensible datas (grafana)
- [x] rule files into prometheus.yml ??

### Adds
- [] cAdvisor (docker metrics)
- [] nginx-exporter if reverseproxy
- [] databases metrics
- [] Remove ports from prometheus container
- [] check if auto-mnotoring prom is not a secured issue (`localhost:900`)
- [] Monitor ELK as well
- [] monitor front as well
- [] Check https conenction (prom, alert, grafana)
- [] Setup specific network to prometheus exporter

---
### MONITORING DOCUMENTATION
We choose to use fastify-metrics, using the official prom-client under the hook but offer's us an abstact level adapted to the framework we're using (with, automatic `/metrics` routes and automatic HTTP metrics.
```javascript
await app.register(fastifyMetrics, {
  endpoint: '/metrics'
});

```
Ainsi on expose les metrics de chaque service sur une route et Prometheus va pouvoir scrapper ces données en faisant des requetes HTTP GET vers la route. On ne passe pas par le Gateway pour ne pas avoir de latence supplémentaire.
#### Prometheus

#### Data retention and storage strategies
Config simple, car tournera peut de temps (6GB dispo pour tous les services) évite de saturer docker. Prometheus supprimera les blocs les plus anciens du TSBD pour atteindre 1GB ou e pas conserver de metrics qui datent de plus de 7 jours. La persistence du volume docker en local suffit à gérer la persistence de données en cas de relance de services. Pour ce projet étudiant qui tournera quqleues heures en corrections on ne fera pas de snapshots.
La compression du WAL est de son côté automatiquement enable sur les versions post 2.20.0, et permet de compresser le journal d'écriture et de le portéger en cas de crash de prometheus. 


#### Alertmanager
Stocke les alertes et les envoit vers discord via l webhook. Gère le https tout seul. Il est ici exposé en local 127.0.0.1:9093:9093 pour monitorer les alertes

Comme alertmanager est en busybox il ne gère pas les ${VAR} donc nous avons du créer un Dockerfile custom qui avec alpine et sh fait une substitution des variables dans le fichier. Anisi notre webhook peut etre spécifié dans un .env et rester en privé.
Sur des grosses prods, des outils comme kubernetees secrets sont utilisés.

#### Grafana



### Doc
- [Fasttify-metrics Offical Documentation](https://www.npmjs.com/package/fastify-metrics?activeTab=readme)
- [Prometheus Official Documentation](https://prometheus.io/docs/prometheus/latest/getting_started/)
- [Alterting philosophy by Bob Ewaschuk from observations at Google](https://docs.google.com/document/d/199PqyG3UsyXlwieHaqbGiWVa8eMWi8zzAn0YfcApr8Q/edit?pli=1&tab=t.0#heading=h.fs3knmjt7fjy)
- [Github issue for variable substitution](https://github.com/prometheus/prometheus/issues/2357)

