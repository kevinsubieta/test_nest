# -----------------------------------------------------------------------------
# Auto Scaling para el servicio orders.
#
# Cómo funciona:
#   1. aws_appautoscaling_target define el rango [min, max] de réplicas.
#   2. aws_appautoscaling_policy define la regla: "mantené la CPU media en X%".
#   3. CloudWatch publica la métrica de CPU del servicio ECS cada minuto.
#   4. Si la CPU media supera el target → agrega tasks.
#      Si baja → retira tasks (respetando el mínimo).
#
# Esto se demuestra fácil:
#   - hey -z 60s -c 50 http://<ALB>/orders/health  (mete carga)
#   - en AWS Console → ECS → orders → ver Running tasks subir de 2 a 4-5.
# -----------------------------------------------------------------------------

resource "aws_appautoscaling_target" "orders" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.orders.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.orders_min_count
  max_capacity       = var.orders_max_count
}

resource "aws_appautoscaling_policy" "orders_cpu" {
  name               = "${var.project_name}-orders-cpu-tracking"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.orders.service_namespace
  resource_id        = aws_appautoscaling_target.orders.resource_id
  scalable_dimension = aws_appautoscaling_target.orders.scalable_dimension

  target_tracking_scaling_policy_configuration {
    target_value = var.orders_cpu_target

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    # Tiempos generosos para evitar oscilaciones (flapping) en demos.
    scale_in_cooldown  = 60
    scale_out_cooldown = 30
  }
}
