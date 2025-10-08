### Backend configuration
**fastify-metrics**
- [x] auth
- [] game
- [] tournament
- [] user
- [] websocket
[] Add hook on gateway to prevent `http://localhost:4443/auth/metrics` exposition

### Completing setup
[] Prometheus configuration
[] Grafana configuration
[] Creating dashboards .json
[] Altermanager
[] data retention ans storage
[] secure connection between component
[] control mecansim for sensible datas (grafana)
[] rule files into prometheus.yml ??

### Adds
[] cAdvisor (docker metrics)
[] nginx-exporter if reverseproxy
[] databases metrics
[] remove ports from prometheus container

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

### Grafana


### Doc
- [Fasttify-metrics Offical Documentation](https://www.npmjs.com/package/fastify-metrics?activeTab=readme)


