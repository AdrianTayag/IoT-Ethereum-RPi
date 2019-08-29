int but = 0;
int timer = 0;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:
  int sensorValue = analogRead(A0);
  int button = digitalRead(A1);
  float voltage= sensorValue * (5.0 / 1023.0);
  if (button == HIGH && but == 0) {
    but = 1;
  }
  if (but == 1 && voltage == 5.0){
    Serial.println(timer);
  }
  if (but == 1) {
    timer = timer + 10;
  }
  delay(10);
}