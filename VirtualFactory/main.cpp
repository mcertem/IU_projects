//////////////////////////////////////////
// Mustafa Cem ERTEM
// 1306191441
// Date: 2021.05.22
// IDE: CodeBlock (with GCC compiler)
///////////////////////////////////////////
//  Tek bir en iyi çözüm bulamadým. Ýçlerinde en basit çözüm olan "Sadece deadline'a göre sýralanmak" da olmak üzere 4 farklý yönteme göre çözüp, deadline kaçýrmadan en hýzlý sonucu veren algoritmayý output dosyasýna basýyorum. En basit çözümü de ekleme sebebim, karmaþýk algoritmalarda deadline kaçýrma istisnalarý olabilirse, o veri setine ait case'i çözümsüz býrakmaka içindir. Bu naive algoritma da çözemiyorsa, yani deadline kaçýrýyorsa, zaten çözümsüz bir veri seti verilmiþ demektir.
//////////////////////////////////////////

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <queue>
#include <algorithm>

using namespace std;

const int aLargeInt = 10000000;
ofstream output_file;
const string seperator = ";";

class Order {
public:
    string orderCode;
    int amountOfWork;
    string operationCode;
    int deadline;

    int durationOfWork;
};

class Operation {
public:
    string operationCode;
    int speedOfOp;
    /*int countOfOp;
    vector<Order*> orders;
    map<string, int> setupTimeTo;
    int avgDurationOfAll;
    int totalDurationOfAll;
    int avgDeadlineOfAll;*/
};

vector<string> splitString(string s, string delimiter) {
    size_t pos = 0;
    vector<string> strArr;

    while ((pos = s.find(delimiter)) != string::npos) {
        strArr.push_back(s.substr(0, pos));
        s.erase(0, pos + delimiter.length());
    }
    strArr.push_back(s);
    return strArr;
}

void writeToFile(string scheduleTime, string opCode, string orderCode, string workAmount, string setupTime) {
    output_file << scheduleTime + seperator + opCode + seperator + orderCode + seperator + workAmount + seperator + setupTime + "\n\r";
}

string findMinCostOperationChange(string curOpCode, map<pair<string, string>, int> setupDurations) {
    int minCost = 1000000;
    string nextOpCode;

    for (auto s : setupDurations) {
        if (s.first.first == curOpCode) {
            if (s.second < minCost) {
                minCost = s.second;
                nextOpCode = s.first.second;
            }
        }
    }

    return nextOpCode;
}

int onlyDeadlineBasedSchedule(vector<Order*> orders, map<pair<string, string>, int> setupDurations, bool writeResultToOutputFile = false) {
    try {
        int scheduleTime = 0;
        string lastOpCode = "";
        int setupTime = 0;

        for(auto i : orders) {

            if (i->operationCode != lastOpCode) {
                setupTime = setupDurations[make_pair(lastOpCode, i->operationCode)];
            } else {
                setupTime = 0;
            }

            if (writeResultToOutputFile) {
                writeToFile(to_string(scheduleTime + setupTime), i->operationCode, i->orderCode, to_string(i->amountOfWork), to_string(setupTime));
            }

            scheduleTime += i->durationOfWork + setupTime;
            lastOpCode = i->operationCode;
        }

        //cout << "onlyDeadlineBasedSchedule total duration: " << to_string(scheduleTime) << endl;
        return scheduleTime;
    } catch (exception ex) {
        return aLargeInt;
    }


}

int opGroupBasedSchedule(vector<Order*> orders, map<pair<string, string>, int> setupDurations, bool writeResultToOutputFile = false) {
    try {
        int scheduleTime = 0;
        int setupTime = 0;
        int index = 0;
        string lastOpCode = orders[index]->operationCode;


        while(!orders.empty()) {

            if (index == orders.size()) {
                index = 0;
                setupTime = setupDurations[make_pair(lastOpCode, orders[0]->operationCode)];
                lastOpCode = orders[0]->operationCode;
                continue;
            }

            if (lastOpCode == orders[index]->operationCode)  {

                // control whether the closestDeadlineOrder have not enough time o
                if(index > 0 && (scheduleTime + orders[index]->durationOfWork > orders[0]->deadline - orders[0]->durationOfWork - setupDurations[make_pair(orders[index]->operationCode, orders[0]->operationCode)])) {
                    index = 0;
                    setupTime = setupDurations[make_pair(lastOpCode, orders[0]->operationCode)];
                    lastOpCode = orders[0]->operationCode;
                    continue;
                }
                // Write order info to output and reset parameters
                else {
                    if (writeResultToOutputFile) {
                        writeToFile(to_string(scheduleTime + setupTime), orders[index]->operationCode, orders[index]->orderCode, to_string(orders[index]->amountOfWork), to_string(setupTime));
                    }

                    scheduleTime += orders[index]->durationOfWork + setupTime;
                    lastOpCode = orders[index]->operationCode;
                    orders.erase(orders.begin() + index);
                    setupTime = 0;
                }
            }
            else {
                index++;
            }
        }

        //cout << "opGroupBasedSchedule total duration: " << to_string(scheduleTime) << endl;
        return scheduleTime;
    } catch (exception ex) {
        return aLargeInt;
    }
}

int setupTimePrioritizedOpGroupBasedSchedule(vector<Order*> orders, map<pair<string, string>, int> setupDurations, bool writeResultToOutputFile = false) {
    try {
        int scheduleTime = 0;
        int setupTime = 0;
        int index = 0;
        string lastOpCode = orders[index]->operationCode;
        string nextOpCode = orders[index]->operationCode;
        vector<string> opCodes;


        while(!orders.empty()) {

            if (index == orders.size()) {
                for (auto s: setupDurations) {
                     if (s.first.first == lastOpCode) {
                            opCodes.push_back(s.first.first);
                     }
                }

                for (auto c : opCodes) {
                    setupDurations.erase(make_pair(lastOpCode, c));
                    setupDurations.erase(make_pair(c, lastOpCode));
                }

                nextOpCode = findMinCostOperationChange(lastOpCode, setupDurations);

                index = 0;
                setupTime = setupDurations[make_pair(lastOpCode, nextOpCode)];
                lastOpCode = nextOpCode;
                continue;
            }

            if (lastOpCode == orders[index]->operationCode)  {

                // control whether the closestDeadlineOrder have not enough time o
                if(index > 0 && (scheduleTime + orders[index]->durationOfWork > orders[0]->deadline - orders[0]->durationOfWork - setupDurations[make_pair(orders[index]->operationCode, orders[0]->operationCode)])) {
                    index = 0;
                    setupTime = setupDurations[make_pair(lastOpCode, orders[0]->operationCode)];
                    lastOpCode = orders[0]->operationCode;
                    continue;
                }
                // Write order info to output and reset parameters
                else {
                    if (writeResultToOutputFile) {
                        writeToFile(to_string(scheduleTime + setupTime), orders[index]->operationCode, orders[index]->orderCode, to_string(orders[index]->amountOfWork), to_string(setupTime));
                    }

                    scheduleTime += orders[index]->durationOfWork + setupTime;
                    lastOpCode = orders[index]->operationCode;
                    orders.erase(orders.begin() + index);
                    setupTime = 0;
                }
            }
            else {
                index++;
            }
        }

        //cout << "setupTimePrioritizedOpGroupBasedSchedule total duration: " << to_string(scheduleTime) << endl;
        return scheduleTime;
    } catch (exception ex) {
        return aLargeInt;
    }
}


int strictDeadlinesAndSetupTimePrioritizedOpGroupBasedSchedule(vector<Order*> orders, map<pair<string, string>, int> setupDurations, bool writeResultToOutputFile = false) {
    try {
        int scheduleTime = 0;
        int setupTime = 0;
        int index = 0;
        int strictDeadlinesRequiredWorkTime = 0;
        int strictDeadlinesRequiredSetupTime = 0;
        map<pair<string, string>, int> strictDeadlinesSetupDurations;
        string lastOpCode = orders[index]->operationCode;
        string nextOpCode = orders[index]->operationCode;
        vector<string> opCodes;

        while(!orders.empty()) {

            if (index == orders.size()) {
                strictDeadlinesRequiredWorkTime = 0;
                strictDeadlinesRequiredSetupTime = 0;
                strictDeadlinesSetupDurations.clear();


                for (auto s: setupDurations) {
                     if (s.first.first == lastOpCode) {
                            opCodes.push_back(s.first.first);
                     }
                }

                for (auto c : opCodes) {
                    setupDurations.erase(make_pair(lastOpCode, c));
                    setupDurations.erase(make_pair(c, lastOpCode));
                }

                nextOpCode = findMinCostOperationChange(lastOpCode, setupDurations);

                index = 0;
                setupTime = setupDurations[make_pair(lastOpCode, nextOpCode)];
                lastOpCode = nextOpCode;
                continue;
            }

            if (lastOpCode == orders[index]->operationCode)  {

                // control whether the closestDeadlineOrder have not enough time o
                if(index > 0
                   && (scheduleTime + orders[index]->durationOfWork > orders[0]->deadline - orders[0]->durationOfWork - setupDurations[make_pair(orders[index]->operationCode, orders[0]->operationCode)])
                   && (scheduleTime + orders[index]->durationOfWork > orders[index -1]->deadline - strictDeadlinesRequiredWorkTime - strictDeadlinesRequiredSetupTime)
                ) {
                    index = 0;
                    setupTime = setupDurations[make_pair(lastOpCode, orders[0]->operationCode)];
                    lastOpCode = orders[0]->operationCode;
                    continue;
                }
                // Write order info to output and reset parameters
                else {
                    if (writeResultToOutputFile) {
                        writeToFile(to_string(scheduleTime + setupTime), orders[index]->operationCode, orders[index]->orderCode, to_string(orders[index]->amountOfWork), to_string(setupTime));
                    }

                    scheduleTime += orders[index]->durationOfWork + setupTime;
                    lastOpCode = orders[index]->operationCode;
                    orders.erase(orders.begin() + index);
                    setupTime = 0;
                }
            }
            else {
                strictDeadlinesRequiredWorkTime += orders[index]->amountOfWork;
                bool alreadyChanged = false;
                for (auto s: strictDeadlinesSetupDurations) {
                    if (s.first.second == orders[index]->operationCode) {
                        alreadyChanged = true;
                        break;
                    }
                }
                if (!alreadyChanged) {
                    strictDeadlinesRequiredSetupTime += setupDurations[make_pair(orders[index]->operationCode, lastOpCode)];
                    strictDeadlinesSetupDurations[make_pair(orders[index]->operationCode, lastOpCode)] = setupDurations[make_pair(orders[index]->operationCode, lastOpCode)];
                    strictDeadlinesSetupDurations[make_pair(lastOpCode, orders[index]->operationCode)] = setupDurations[make_pair(orders[index]->operationCode, lastOpCode)];
                }
                index++;
            }

        }
        //cout << "strictDeadlinesAndSetupTimePrioritizedOpGroupBasedSchedule total duration: " << to_string(scheduleTime) << endl;
        return scheduleTime;

    }
    catch (exception ex) {
        return aLargeInt;
    }

}


int main()
{
    ifstream input_file;
    string input_line;
    vector<string> inputs;
    map<pair<string, string>, int> setupDurations;
    vector<Order*> orders;
    map<string, Operation> operations;
    vector<int> operationAvgDeadlines;

    // read the operations file
    Operation op;
    input_file.open("Operations.txt");
    while (getline (input_file, input_line)) {
        inputs = splitString(input_line, ";");
        op.operationCode = inputs[0];
        op.speedOfOp = atoi(inputs[1].c_str());

        operations[op.operationCode] = op;
    }
    input_file.close();
    input_file.clear();


    // read the setup durations file
    input_file.open("SetupDuration.txt");
    while (getline (input_file, input_line)) {
        inputs = splitString(input_line, ";");
        setupDurations[make_pair(inputs[0], inputs[1])] = atoi(inputs[2].c_str());
        setupDurations[make_pair(inputs[1], inputs[0])] = atoi(inputs[2].c_str());
    }
    input_file.close();
    input_file.clear();

    // read the orders file
    input_file.open("Orders.txt");

    // int totalDuration = 0;
    while (getline (input_file, input_line)) {
        inputs = splitString(input_line, ";");
        Order *order = new Order();
        order->orderCode = inputs[0];
        order->amountOfWork = atoi(inputs[1].c_str());
        order->operationCode = inputs[2];
        order->deadline = atoi(inputs[3].c_str());
        order->durationOfWork = order->amountOfWork / operations[order->operationCode].speedOfOp;
        if (order->amountOfWork % operations[order->operationCode].speedOfOp != 0) order->durationOfWork++;
        orders.push_back(order);

        //totalDuration += order->durationOfWork;
    }
    input_file.close();
    input_file.clear();
    sort(orders.begin(), orders.end(), [](Order* a, Order* b){ return a->deadline < b->deadline; });

    //cout << "total duration:" << totalDuration << endl;

    int algResult;
    int mostEfficentAlgorithm = 1;
    int minScheduleTime = onlyDeadlineBasedSchedule(orders, setupDurations);

    algResult = opGroupBasedSchedule(orders, setupDurations);
    if (algResult < minScheduleTime) {
        minScheduleTime = algResult;
        mostEfficentAlgorithm = 2;
    }

    algResult = setupTimePrioritizedOpGroupBasedSchedule(orders, setupDurations);
    if (algResult < minScheduleTime) {
        minScheduleTime = algResult;
        mostEfficentAlgorithm = 3;
    }

    algResult = strictDeadlinesAndSetupTimePrioritizedOpGroupBasedSchedule(orders, setupDurations);
    if (algResult < minScheduleTime) {
        minScheduleTime = algResult;
        mostEfficentAlgorithm = 4;
    }

    output_file.open("Schedule.txt");
    switch (mostEfficentAlgorithm) {
        case 1:
            onlyDeadlineBasedSchedule(orders, setupDurations, true);
            break;
        case 2:
            opGroupBasedSchedule(orders, setupDurations, true);
            break;
        case 3:
            setupTimePrioritizedOpGroupBasedSchedule(orders, setupDurations, true);
            break;
        case 4:
            strictDeadlinesAndSetupTimePrioritizedOpGroupBasedSchedule(orders, setupDurations, true);
            break;
    }
    output_file.close();

    return 0;
}
