//////////////////////////////////////////
// Mustafa Cem ERTEM
// 1306191441
// Date: 2021.05.19
// IDE: CodeBlock (with GCC compiler)
///////////////////////////////////////////
// elimdeki bilgisayarın hardiski bitik. bu nedenle vstudio'ya 4gb boyuundaki c++ eklentilerini indiremedim. codeblock ide'si üzerinden gcc compiler yardımıyal yaptım
//////////////////////////////////////////

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <map>
#include <queue>

using namespace std;


class Node {
public:
    char type;
    char order;
    vector<Node*> adjNodeList;

    Node(char x, char y) {
        type = x;
        order = y;
    }

    void addEdge(Node* node) {
        adjNodeList.push_back(node);
    }

    string getName() {
        string nodeName = "";
        nodeName += type;
        nodeName += order;
        return nodeName;
    }
};


bool checkBFS(Node* activeNode, string targetPath)
{
    int controlOrder = 1;
    queue<Node*> traverseQueue;
    traverseQueue.push(activeNode);

    while(!traverseQueue.empty())
    {
        activeNode = traverseQueue.front();
        traverseQueue.pop();

        for (auto x : activeNode->adjNodeList) {
            if (x->getName()[0] == targetPath[controlOrder]) {
                traverseQueue.push(x);
                controlOrder++;
                if (controlOrder == targetPath.length()) return true;
            }
        }
    }
    return false;
}

int main()
{
    ifstream input_file("input.txt");
    string input_line;
    map<string, Node*> nodeMap;
    vector<string> nodeNames;

    // node'ları bir MAP de saklayan kısım
    getline (input_file, input_line);
    for (int i=0; i < input_line.size(); i += 3 ) {
        Node* node = new Node(input_line[i], input_line[i+1]);
        nodeNames.push_back(node->getName());
        nodeMap[node->getName()] = node;
    };

    getline (input_file, input_line);   // "Links:" başlığı

    // node'ların diğer node'lara olan yollarını ilgili node'un vektörüne atayaın kısım
    map<string, Node*>::iterator itr1, itr2;
    while (getline (input_file, input_line)) {
      if (input_line == "Paths:") break;    // "Paths" başlığı ise bu lopptan çık

      itr1 = nodeMap.find(string() + input_line[0] + input_line[1]);
      itr2 = nodeMap.find(string() + input_line[4] + input_line[5]);
      itr1->second->addEdge(itr2->second);
    }

    // input'ta verilen path'lerin varlığını sorgulayan kısım
    ofstream output_file("output.txt");
    bool firstLine = true;
    bool isPathTraversable;
    string result;

    while (getline (input_file, input_line)) {
      if (firstLine) firstLine = false;
      else output_file << endl;
      output_file << input_line << " ";

      isPathTraversable = false;
      for (string nn : nodeNames) {
        if (nn[0]==input_line[0]) {
            itr2 = nodeMap.find(nn);
            isPathTraversable = checkBFS (itr2->second, input_line);
        }
        if (isPathTraversable) break;
      }

      result = isPathTraversable ? "YES" : "NO";
      output_file << "[" << result << "]";
    }

    input_file.close();
    output_file.close();
    return 0;
}
