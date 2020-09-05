# angular-pipe-object-filter
This can be used to filter array or json object with multiple conditions.

### Usage

###### TYPE_FILTER - {type : 'object',key:'values'}
###### DATA_FILTER - { 'key': 'values.value', 'string' : [null, undefined,''], 'condition' : 'not'}
```html
<div [innerHtml]="content | objectFilter : [TYPE_FILTER] : [DATA_FILTER]">
  <!--   content -->
</div>
```

#### Developer
[Babu S.R](http://babu-sr.github.io/profile "Profile")
